import { UpdateBranchInfoRequest } from '@delivest/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBranchInfoDto implements UpdateBranchInfoRequest {
  @ApiPropertyOptional({ example: 'Основной филиал в центре города' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'ул. Пушкина, д. Колотушкина' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
