import { Body, Controller, Post } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  async createBranch(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }
}
