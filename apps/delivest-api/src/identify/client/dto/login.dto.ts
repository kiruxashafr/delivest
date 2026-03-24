import { PASSWORD_REGEX } from '@delivest/common';
import { LoginClientRequest } from '@delivest/types';
import { IsString, Matches } from 'class-validator';

export class LoginClientDto implements LoginClientRequest {
  @IsString()
  phone!: string;

  @IsString()
  @Matches(PASSWORD_REGEX)
  password!: string;
}
