import { PASSWORD_REGEX, PHONE_REGEX } from '@delivest/common';
import { CreateClientRequest } from '@delivest/types';
import { IsString, Matches } from 'class-validator';

export class CreateClientDto implements CreateClientRequest {
  @IsString()
  @Matches(PHONE_REGEX)
  phone!: string;

  @IsString()
  @Matches(PASSWORD_REGEX)
  password?: string;
}
