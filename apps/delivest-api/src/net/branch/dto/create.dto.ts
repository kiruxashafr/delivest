import { CreateBranchRequest } from '@delivest/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto implements CreateBranchRequest {
  @ApiProperty({ example: 'Наугорское шоссе' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'naug' })
  @IsString()
  alias!: string;
}
