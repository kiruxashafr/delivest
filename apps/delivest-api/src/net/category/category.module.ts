import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryController } from './category.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AdminCategoryController } from './admin-category.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { IdentityModule } from '../../identify/identify.module.js';
import { CategoryReorderWorker } from './workers/category-reorder.worker.js';
import { BranchModule } from '../branch/branch.module.js';

@Module({
  imports: [PrismaModule, JwtModule, IdentityModule, BranchModule],
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService, CategoryReorderWorker],
  exports: [CategoryService],
})
export class CategoryModule {}
