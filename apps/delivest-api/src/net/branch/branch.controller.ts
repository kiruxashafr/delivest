import { Controller, Get } from '@nestjs/common';
import { BranchService } from './branch.service.js';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  async findAllBranch() {
    return this.branchService.findAll();
  }
}
