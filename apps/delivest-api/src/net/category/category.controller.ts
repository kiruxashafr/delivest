import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ReadCategoryDto } from './dto/read-category.dto.js';
import { CategoryService } from './category.service.js';
import { GetCategoryDto } from './dto/get-category.dto.js';

@ApiTags('Category (Категории)')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  @ApiOperation({ summary: 'Получить все категории по айди филиала' })
  @ApiOkResponse({ type: ReadCategoryDto })
  @ApiNotFoundResponse({ description: 'Категории не найдены' })
  async getAllCtaegory(@Query() dto: GetCategoryDto) {
    return this.categoryService.findAllByBranch(dto.id);
  }

  @Get('one')
  @ApiOperation({ summary: 'Получить одну категорию по айди' })
  @ApiOkResponse({ type: ReadCategoryDto })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  async getCategory(@Query() dto: GetCategoryDto) {
    return this.categoryService.findOne(dto.id);
  }
}
