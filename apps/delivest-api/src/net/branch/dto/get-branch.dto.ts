import { GetBranchRequest } from '@delivest/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetBranchDto implements GetBranchRequest {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
