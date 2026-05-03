import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create.dto.js';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateCategoryRequest } from '@delivest/types';

export class UpdateCategoryDto
  extends PartialType(CreateCategoryDto)
  implements UpdateCategoryRequest
{
  @ApiProperty({ example: 'cat-123' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: '2000' })
  @IsNumber()
  @IsOptional()
  order?: number;
}
