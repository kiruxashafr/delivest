import { Expose } from 'class-transformer';
import { Permission } from '../../../../generated/prisma/enums.js';
import { RoleResponse } from '@delivest/types';

export class ReadRoleDto implements RoleResponse {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  permissions!: Permission[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
