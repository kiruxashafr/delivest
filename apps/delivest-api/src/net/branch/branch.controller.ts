import { Controller, Get, Query } from '@nestjs/common';
import { BranchService } from './branch.service.js';
import { GetBranchDto } from './dto/get-branch.dto.js';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  async findAllBranch() {
    return this.branchService.findAll();
  }

  @Get('info')
  async getBranchInfo(@Query() dto: GetBranchDto) {
    return this.branchService.getInfo(dto.id);
  }
}
