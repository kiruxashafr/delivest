import { Module } from '@nestjs/common';
import { RoleService } from './role.service.js';

@Module({
  imports: [],
  controllers: [],
  providers: [RoleService],
  exports: [RoleService],
})
export class AclModule {}
