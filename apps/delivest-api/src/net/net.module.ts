import { Module } from '@nestjs/common';
import { NetService } from './net.service';
import { BranchModule } from './branch/branch.module';

@Module({
  imports: [BranchModule],
  providers: [NetService],
  exports: [],
})
export class NetModule {}
