import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import { BadRequestException } from '../../shared/exception/domain_exception/domain-exception.js';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const branches = await this.prisma.branch.findMany();
      return branches;
    } catch (error) {
      this.logger.error(
        `findAllBranch() | error find all branch ${(error as Error).message}`,
      );
      throw new BadRequestException();
    }
  }

  async getInfo(id: string) {
    try {
      const branches = await this.prisma.branch.findUnique({
        where: {
          id: id,
        },
        include: {
          info: true,
        },
      });
      return branches;
    } catch (error) {
      this.logger.error(
        `findAllBranch() | error find all branch ${(error as Error).message}`,
      );
      throw new BadRequestException();
    }
  }
}
