import { BranchResponce } from '@delivest/types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AdminReadBranchDto implements BranchResponce {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  alias!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiProperty()
  @Expose()
  phone!: string;

  @ApiProperty()
  @Expose()
  address!: string;

  @ApiProperty({ example: '2026-04-05T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-04-05T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({ example: null, required: false })
  @Expose()
  deletedAt?: Date | null;
}
