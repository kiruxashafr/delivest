import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import {
  BadRequestException,
  DomainException,
  DuplicateValueException,
  NotFoundException,
} from '../../shared/exceptions/domain_exception/domain-exception.js';
import { toDto } from '../../utils/to-dto.js';
import { ReadBranchDto } from './dto/read-branch.dto.js';
import { CreateBranchDto } from './dto/create.dto.js';
import { PrismaErrorCode } from '@delivest/common';
import {
  getInternalErrorCode,
  getPrismaModelName,
  isPrismaError,
} from '../../shared/helpers/db-errors.js';
import { AdminReadBranchDto } from './dto/admin-read.dto.js';
import { UpdateBranchDto } from './dto/update.dto.js';
import { Prisma } from '../../../generated/prisma/client.js';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReadBranchDto[]>;

  async findAll(
    extended: true,

    branchFilter?: Prisma.BranchWhereInput,
  ): Promise<AdminReadBranchDto[]>;

  async findAll(
    extended?: boolean,

    branchFilter?: Prisma.BranchWhereInput,
  ): Promise<ReadBranchDto[] | AdminReadBranchDto[]> {
    try {
      const branches = await this.prisma.branch.findMany({
        where: {
          deletedAt: null,

          ...branchFilter,
        },
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

  async findOne(id: string): Promise<ReadBranchDto>;
  async findOne(id: string, extended: true): Promise<AdminReadBranchDto>;
  async findOne(
    id: string,
    extended?: boolean,
  ): Promise<ReadBranchDto | AdminReadBranchDto> {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id, deletedAt: null },
      });

      if (!branch) {
        throw new NotFoundException(`Branch ${id} not found`);
      }

      return extended
        ? toDto(branch, AdminReadBranchDto)
        : toDto(branch, ReadBranchDto);
    } catch (error) {
      if (error instanceof DomainException) throw error;
      this.logger.error(
        `findOne() | id: ${id} | error: ${(error as Error).stack}`,
      );
      throw new BadRequestException();
    }
  }

  async update(id: string, dto: UpdateBranchDto): Promise<AdminReadBranchDto> {
    try {
      const updated = await this.prisma.branch.update({
        where: { id },
        data: dto,
      });

      return toDto(updated, AdminReadBranchDto);
    } catch (error) {
      this.logger.error(
        `update() | id: ${id} | error: ${(error as Error).stack}`,
      );
      this.handleProductConstraintError(error);
    }
  }

  async create(dto: CreateBranchDto): Promise<AdminReadBranchDto> {
    try {
      const newBranch = await this.prisma.branch.create({
        data: { ...dto },
      });
      return toDto(newBranch, AdminReadBranchDto);
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

    const modelTranslations: Record<string, string> = {
      Branch: 'Филиал',
      User: 'Пользователь',
    };

    const translatedModel = modelName
      ? modelTranslations[modelName] || modelName
      : 'Запись';

    if (internalCode === PrismaErrorCode.RECORD_NOT_FOUND) {
      throw new NotFoundException(`${translatedModel} не найден(а)`);
    }

    if (internalCode === PrismaErrorCode.UNIQUE_VIOLATION) {
      if (modelName === 'Branch') {
        throw new BadRequestException(
          'Филиал с таким названием уже существует',
        );
      }
      throw new DuplicateValueException('Такое значение уже используется');
    }

    throw new BadRequestException(' Ошибка при работе с базой данных');
  }
}
