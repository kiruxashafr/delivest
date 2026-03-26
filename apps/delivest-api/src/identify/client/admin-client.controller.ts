import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindByPhoneDto } from './dto/find-by-phone.dto.js';
import { JwtStaffAuthGuard } from '../staff/guards/jwt-staff.guard.js';
import { AclGuard } from '../acl/guards/acl.guard.js';
import { RequirePermission } from '../acl/decorators/require-permission.decorator.js';
import { Permission } from '../../../generated/prisma/enums.js';
import { GetClientDto } from './dto/get.dto.js';
import { AdminReadClientDto } from './dto/admin-dto/admin-read.dto.js';

@ApiTags('Admin-client (Клиенты-crm)')
@Controller('admin/client')
export class AdminClientController {
  private readonly logger = new Logger(AdminClientController.name);

  constructor(private readonly service: ClientService) {}

  @Get('all')
  @ApiOperation({ summary: 'Найти всех клиентов' })
  @UseGuards(JwtStaffAuthGuard, AclGuard)
  @RequirePermission(Permission.CLIENT_READ)
  async findAll() {
    return await this.service.findAll();
  }

  @Get('find-by-phone')
  @ApiOperation({ summary: 'Найти клиента по номеру телефона' })
  @UseGuards(JwtStaffAuthGuard, AclGuard)
  @RequirePermission(Permission.CLIENT_READ)
  async findByPhone(@Param() dto: FindByPhoneDto): Promise<AdminReadClientDto> {
    return await this.service.findOneByPhone(dto.phone, true);
  }

  @Get('')
  @ApiOperation({ summary: 'Найти клиента по айди' })
  @UseGuards(JwtStaffAuthGuard, AclGuard)
  @RequirePermission(Permission.CLIENT_READ)
  async findOne(@Param() dto: GetClientDto): Promise<AdminReadClientDto> {
    return await this.service.findOne(dto.id, true);
  }
}
