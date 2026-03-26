import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service.js';
import { ReadRoleDto } from './dto/read-role.dto.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtStaffAuthGuard } from '../staff/guards/jwt-staff.guard.js';
import { Permission } from '../../../generated/prisma/client.js';
import { GetRoleDto } from './dto/get-role.dto.js';
import { RequirePermission } from './decorators/require-permission.decorator.js';
import { AclGuard } from './guards/acl.guard.js';

@ApiTags('Roles (Роли)')
@Controller('roles')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Создать роль' })
  @UseGuards(JwtStaffAuthGuard, AclGuard)
  @RequirePermission(Permission.ADMIN)
  async create(@Body() dto: CreateRoleDto): Promise<ReadRoleDto> {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Найти роль' })
  async findOne(@Param() dto: GetRoleDto): Promise<ReadRoleDto> {
    return this.service.findById(dto.id);
  }
}
