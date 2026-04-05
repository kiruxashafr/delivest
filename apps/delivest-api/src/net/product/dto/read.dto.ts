import { ProductResponse } from '@delivest/types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReadProductDto implements ProductResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  branchId: string;

  @ApiProperty({ type: Number })
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  categoryId?: string | undefined;

  @ApiProperty({ required: false })
  @Expose()
  description?: string | undefined;
}
