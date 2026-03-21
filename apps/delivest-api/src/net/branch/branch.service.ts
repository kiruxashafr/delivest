import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateBranchDto } from './dto/create-branch.dto';
import { BadRequestException } from '../../shared/exception/domain_exception/domain-exception';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBranchDto) {
    try {
      const branch = await this.prisma.branches.create({
        data: {
          name: dto.name,
          url: dto.url,
        },
      });
      return branch;
    } catch (error) {
      this.logger.error(
        `createBranch() | error creating branch ${(error as Error).message}`,
      );
      throw new BadRequestException();
    }
  }
}
