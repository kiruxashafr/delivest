import { Module } from '@nestjs/common';
import { BranchService } from './branch.service.js';
import { BranchController } from './branch.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AdminBranchController } from './admin-branch.controller.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [BranchController, AdminBranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
