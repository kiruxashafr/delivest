import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '../../shared/exceptions/domain_exception/domain-exception.js';
import { AccessStaffTokenPayload } from '@delivest/types';
import { Prisma } from '../../../generated/prisma/client.js';

@Injectable()
export class BranchAbilityService {
  applyBranchPolicy(
    staffTokenPaylod: AccessStaffTokenPayload,
  ): Prisma.BranchWhereInput {
    if (staffTokenPaylod?.permissions?.includes('ADMIN')) {
      return { deletedAt: null };
    }

    const staffBranchIds = staffTokenPaylod?.branchIds ?? [];

    if (staffBranchIds.length === 0) {
      throw new ForbiddenException('Вы не привязаны ни к одному филиалу');
    }

    return {
      id: { in: staffBranchIds },
      deletedAt: null,
    };
  }

  hasAccess(
    staffTokenPaylod: AccessStaffTokenPayload,
    branchId: string,
  ): boolean {
    if (staffTokenPaylod?.permissions?.includes('ADMIN')) {
      return true;
    }
    if (!branchId) return false;
    return staffTokenPaylod?.branchIds?.includes(branchId) ?? false;
  }
}
