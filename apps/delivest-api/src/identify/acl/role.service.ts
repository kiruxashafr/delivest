import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  BadRequestException,
  NotFoundException,
} from '../../shared/exception/domain_exception/domain-exception.js';
import { toDto } from '../../utils/to-dto.js';
import { ReadRoleDto } from './dto/read-role.dto.js';
import { CreateRoleDto } from './dto/create-role.dto.js';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ReadRoleDto> {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      this.logger.warn(`findById() | Role not found | id=${id}`);
      throw new NotFoundException('Role not found');
    }

    return toDto(role, ReadRoleDto);
  }

  async create(dto: CreateRoleDto): Promise<ReadRoleDto> {
    this.logger.log(`create() | name=${dto.name}`);

    try {
      this.logger.debug(
        `create() | Creating role with data: ${JSON.stringify(dto)}`,
      );
      const role = await this.prisma.role.create({
        data: {
          name: dto.name,
          permissions: dto.permissions ?? [],
        },
      });

      this.logger.log(`create() | Role created | id=${role.id}`);
      return toDto(role, ReadRoleDto);
    } catch (error: unknown) {
      this.logger.error(
        `create() | ${(error as Error).message}`,
        (error as Error).stack,
      );

      throw new BadRequestException('Failed to create role');
    }
  }
}
