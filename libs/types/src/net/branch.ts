export interface FindBranchRequest {
  id: string;
}

export interface CreateBranchRequest {
  name: string;
  alias: string;
  address?: string;
  phone?: string;
  description?: string;
}

export interface BranchResponce {
  id: string;
  name: string;
  alias: string;
  description?: string;
  address?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type UpdateBranchRequest = Partial<CreateBranchRequest>;
