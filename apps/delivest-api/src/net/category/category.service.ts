import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import {
  BadRequestException,
  DomainException,
  NotFoundException,
} from '../../shared/exception/domain_exception/domain-exception.js';
import { toDto } from '../../utils/to-dto.js';
import { ReadCategoryDto } from './dto/read-category.dto.js';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAllByBranch(branchId: string): Promise<ReadCategoryDto[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { branchId: branchId },
      });
      if (categories.length === 0) {
        throw new NotFoundException();
      }
      return categories.map((category) => toDto(category, ReadCategoryDto));
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      this.logger.error(
        `findAllByBranch() | error find all category by branch ${branchId} ${(error as Error).stack}`,
      );
      throw new BadRequestException();
    }
  }

  async findOne(categoryId: string): Promise<ReadCategoryDto> {
    try {
      const category = await this.prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });
      if (!category) {
        throw new NotFoundException();
      }
      return toDto(category, ReadCategoryDto);
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      this.logger.error(
        `findOneByBranch() | error find category ${categoryId}  ${(error as Error).stack}`,
      );
      throw new BadRequestException();
    }
  }
}
