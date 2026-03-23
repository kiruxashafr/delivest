import { Module } from '@nestjs/common';
import { IdentityService } from './identify.service.js';

@Module({
  imports: [],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
