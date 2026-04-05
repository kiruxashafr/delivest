export interface FindBranchRequest {
  id: string;
}

export interface CreateBranchRequest {
  name: string;
  alias: string;
}

export interface BranchResponce {
  id: string;
  name: string;
  alias: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface BranchDetailsResponce {
  id: string;
  branchId: string;
  description?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type UpdateBranchRequest = Partial<CreateBranchRequest>;

export interface UpdateBranchInfoRequest {
  description?: string;
  address?: string;
}

export interface BranchWithDetailsResponse extends BranchResponce {
  info: BranchDetailsResponce | null;
}
