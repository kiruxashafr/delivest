import { Module } from '@nestjs/common';
import { IdentityService } from './identify.service.js';
import { ClientModule } from './client/client.module.js';
import { StaffModule } from './staff/staff.module.js';
import { AclModule } from './acl/acl.module.js';

@Module({
  imports: [ClientModule, StaffModule, AclModule],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
