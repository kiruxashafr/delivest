import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import {
  BadRequestException,
  DomainException,
  DuplicateValueException,
  NotFoundException,
} from '../../shared/exception/domain_exception/domain-exception.js';
import { toDto } from '../../utils/to-dto.js';
import { ReadBranchDto } from './dto/read-branch.dto.js';
import { ReadBranchDetailsDto } from './dto/read-branch-details.dto.js';
import { ReadBranchWithDetailsDto } from './dto/read-branch-with-details.js';
import { CreateBranchDto } from './dto/create.dto.js';
import { PrismaErrorCode } from '@delivest/common';
import {
  getInternalErrorCode,
  getPrismaModelName,
  isPrismaError,
} from '../../shared/helpers/db-errors.js';
import { AdminReadBranchDto } from './dto/admin-read.dto.js';
import { AdminReadBranchWithDetailsDto } from './dto/admin-read-branch-with-details.dto.js';
import { UpdateBranchInfoDto } from './dto/update-branch-info.dto.js';
import { UpdateBranchDto } from './dto/update.dto.js';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReadBranchDto[]>;
  async findAll(extended: true): Promise<AdminReadBranchDto[]>;
  async findAll(
    extended?: boolean,
  ): Promise<ReadBranchDto[] | AdminReadBranchDto[]> {
    try {
      const branches = await this.prisma.branch.findMany({
        where: { deletedAt: null },
      });

      return branches.map((branch) =>
        extended
          ? toDto(branch, AdminReadBranchDto)
          : toDto(branch, ReadBranchDto),
      );
    } catch (error) {
      if (error instanceof DomainException) throw error;
      this.logger.error(`findAll() | error: ${(error as Error).stack}`);
      throw new BadRequestException();
    }
  }

  async findOne(id: string): Promise<ReadBranchWithDetailsDto>;
  async findOne(
    id: string,
    extended: true,
  ): Promise<AdminReadBranchWithDetailsDto>;
  async findOne(
    id: string,
    extended?: boolean,
  ): Promise<ReadBranchWithDetailsDto | AdminReadBranchWithDetailsDto> {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id },
        include: { info: true },
      });

      if (!branch) {
        throw new NotFoundException(`Branch ${id} not found`);
      }

      return extended
        ? toDto(branch, AdminReadBranchWithDetailsDto)
        : toDto(branch, ReadBranchWithDetailsDto);
    } catch (error) {
      if (error instanceof DomainException) throw error;
      this.logger.error(
        `findOne() | id: ${id} | error: ${(error as Error).stack}`,
      );
      throw new BadRequestException();
    }
  }

  async getBranchDetails(id: string): Promise<ReadBranchDetailsDto> {
    try {
      const branchDetails = await this.prisma.branchInfo.findUnique({
        where: {
          branchId: id,
        },
      });
      if (!branchDetails) {
        throw new NotFoundException();
      }
      return toDto(branchDetails, ReadBranchDetailsDto);
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      this.logger.error(
        `getInfo() | error get branch ${id} info ${(error as Error).stack}`,
      );
      throw new BadRequestException();
    }
  }

  async update(
    id: string,
    dto: UpdateBranchDto,
  ): Promise<AdminReadBranchWithDetailsDto> {
    try {
      const updated = await this.prisma.branch.update({
        where: { id },
        data: dto,
        include: { info: true },
      });

      return toDto(updated, AdminReadBranchWithDetailsDto);
    } catch (error) {
      this.logger.error(
        `update() | id: ${id} | error: ${(error as Error).stack}`,
      );
      this.handleProductConstraintError(error);
    }
  }

  async updateInfo(
    branchId: string,
    dto: UpdateBranchInfoDto,
  ): Promise<AdminReadBranchWithDetailsDto> {
    try {
      const updated = await this.prisma.branch.update({
        where: { id: branchId },
        data: {
          info: {
            update: dto,
          },
        },
        include: { info: true },
      });

      return toDto(updated, AdminReadBranchWithDetailsDto);
    } catch (error) {
      this.logger.error(
        `updateInfo() | branchId: ${branchId} | error: ${(error as Error).stack}`,
      );
      this.handleProductConstraintError(error);
    }
  }

  async create(dto: CreateBranchDto): Promise<AdminReadBranchDto> {
    try {
      const newCategory = await this.prisma.branch.create({
        data: { ...dto, info: { create: {} } },
        include: { info: true },
      });
      return toDto(newCategory, AdminReadBranchWithDetailsDto);
    } catch (error) {
      this.logger.error(
        `create() | ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.handleProductConstraintError(error);
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.prisma.branch.update({
        where: { id: id },
        data: { deletedAt: new Date() },
      });
      this.logger.log(`softDelete() | Category soft-deleted | id=${id}`);
    } catch (error) {
      this.logger.error(
        `softDelete() | Error | id=${id}`,
        (error as Error).stack,
      );

      this.handleProductConstraintError(error);
    }
  }

  private handleProductConstraintError(error: unknown): never {
    if (error instanceof DomainException) {
      throw error;
    }

    if (!isPrismaError(error)) {
      throw error;
    }

    const internalCode = getInternalErrorCode(error);
    const modelName = getPrismaModelName(error);

    if (internalCode === PrismaErrorCode.RECORD_NOT_FOUND) {
      throw new NotFoundException(`${modelName || 'Record'} not found`);
    }

    if (internalCode === PrismaErrorCode.UNIQUE_VIOLATION) {
      if (modelName === 'Branch') {
        throw new BadRequestException('Branch with this name already exists');
      }
      throw new DuplicateValueException();
    }

    throw new BadRequestException('Database operation failed');
  }
}
