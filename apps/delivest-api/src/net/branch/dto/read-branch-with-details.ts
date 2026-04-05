import { BranchWithDetailsResponse } from '@delivest/types';
import { ReadBranchDto } from './read-branch.dto.js';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ReadBranchDetailsDto } from './read-branch-details.dto.js';

export class ReadBranchWithDetailsDto
  extends ReadBranchDto
  implements BranchWithDetailsResponse
{
  @ApiProperty({ type: ReadBranchDetailsDto, nullable: true })
  @Expose()
  @Type(() => ReadBranchDetailsDto)
  info!: ReadBranchDetailsDto | null;
}
