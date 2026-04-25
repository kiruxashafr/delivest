import { CreateBranchRequest } from '@delivest/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto implements CreateBranchRequest {
  @ApiProperty({ example: 'Наугорское шоссе' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'naug' })
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @ApiProperty({ example: 'naug' })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ example: '+79255355278' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ example: 'Лучший ресторан' })
  @IsString()
  @IsOptional()
  description: string;
}
