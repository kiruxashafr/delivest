import { Injectable, Logger } from '@nestjs/common';
import { CategoryService } from '../category.service.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BranchService } from '../../branch/branch.service.js';

@Injectable()
export class CategoryReorderWorker {
  private readonly logger = new Logger(CategoryReorderWorker.name);
  constructor(
    private readonly categoryService: CategoryService,
    private readonly branchService: BranchService,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleReorder() {
    try {
      const branches = await this.branchService.findAll();

      const reorderPromises = branches.map((branch) =>
        this.categoryService.reorderCategoriesForBranch(branch.id),
      );

      await Promise.all(reorderPromises);

      this.logger.log(
        `Successfully reordered categories for ${branches.length} branches.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to reorder categories: ${(error as Error).message}`,
      );
    }
  }
}
