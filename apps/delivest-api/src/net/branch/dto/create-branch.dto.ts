import { CreateBranchRequest } from '@delivest/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto implements CreateBranchRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;
}
