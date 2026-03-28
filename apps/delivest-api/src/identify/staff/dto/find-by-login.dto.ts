import { ApiProperty } from '@nestjs/swagger';
import { FindByLoginRequest } from '@delivest/types';
import { IsString } from 'class-validator';

export class FindByLoginDto implements FindByLoginRequest {
  @ApiProperty({
    description: 'Логин работника',
    example: 'staff',
    required: true,
  })
  @IsString()
  login!: string;
}
