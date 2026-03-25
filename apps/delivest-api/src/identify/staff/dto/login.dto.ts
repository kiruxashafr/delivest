import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_REGEX } from '@delivest/common';
import { IsString, Matches } from 'class-validator';
import { LoginStaffRequest } from '@delivest/types';

export class LoginStaffDto implements LoginStaffRequest {
  @ApiProperty({
    description: 'Логин работника',
    example: 'staff',
    required: true,
  })
  @IsString()
  login!: string;

  @ApiProperty({
    description: 'Пароль работника',
    example: 'SecurePass123!',
    required: true,
    pattern: PASSWORD_REGEX.source,
  })
  @IsString()
  @Matches(PASSWORD_REGEX)
  password!: string;
}
