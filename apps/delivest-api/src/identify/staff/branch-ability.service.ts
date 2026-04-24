import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '../../shared/exceptions/domain_exception/domain-exception.js';
import { AccessStaffTokenPayload } from '@delivest/types';
import { Prisma } from '../../../generated/prisma/client.js';

@Injectable()
export class BranchAbilityService {
  applyBranchPolicy(
    staffTokenPaylod: AccessStaffTokenPayload,
    requestedIds?: string | string[],
  ): Prisma.BranchWhereInput {
    if (staffTokenPaylod?.permissions?.includes('ADMIN')) {
      return {};
    }

    const staffBranchIds = staffTokenPaylod?.branchIds ?? [];

    if (staffBranchIds.length === 0) {
      throw new ForbiddenException('Вы не привязаны ни к одному филиалу');
    }

    let authorizedIds: string[];

    if (
      !requestedIds ||
      (Array.isArray(requestedIds) && requestedIds.length === 0)
    ) {
      authorizedIds = staffBranchIds;
    } else {
      const requested = Array.isArray(requestedIds)
        ? requestedIds
        : [requestedIds];
      authorizedIds = requested.filter((id) => staffBranchIds.includes(id));
    }

    if (authorizedIds.length === 0) {
      throw new ForbiddenException('У вас нет доступа к выбранным филиалам');
    }

    return {
      id: { in: authorizedIds },
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
