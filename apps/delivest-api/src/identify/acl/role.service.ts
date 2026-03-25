import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotFoundException } from '../../shared/exception/domain_exception/domain-exception.js';
import { toDto } from '../../utils/to-dto.js';
import { ReadRoleDto } from './dto/read-role.dto.js';

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
}
