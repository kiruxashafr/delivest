import { PASSWORD_REGEX } from '@delivest/common';
import { CreateStaffRequest } from '@delivest/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateStaffDto implements CreateStaffRequest {
  @ApiProperty({
    description: 'Логин работника',
    example: 'staff',
    required: true,
  })
  @IsString()
  login!: string;

  @ApiPropertyOptional({
    description: 'Пароль (минимум 8 символов, буквы и цифры)',
    example: 'SecurePass123!',
    pattern: PASSWORD_REGEX.source,
    required: false,
  })
  @IsString()
  @Matches(PASSWORD_REGEX)
  password!: string;

  @ApiProperty({
    description: 'Айди роли',
    example: 'role-123',
    required: true,
  })
  @IsString()
  roleId: string;
}
