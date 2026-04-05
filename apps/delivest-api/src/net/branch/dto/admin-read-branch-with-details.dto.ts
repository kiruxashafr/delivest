import { BranchWithDetailsResponse } from '@delivest/types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ReadBranchDetailsDto } from './read-branch-details.dto.js';
import { AdminReadBranchDto } from './admin-read.dto.js';

export class AdminReadBranchWithDetailsDto
  extends AdminReadBranchDto
  implements BranchWithDetailsResponse
{
  @ApiProperty({ type: ReadBranchDetailsDto, nullable: true })
  @Expose()
  @Type(() => ReadBranchDetailsDto)
  info!: ReadBranchDetailsDto | null;
}
