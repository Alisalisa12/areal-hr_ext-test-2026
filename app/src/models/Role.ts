export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateRoleDto {
  name: string;
}

export type UpdateRoleDto = Partial<CreateRoleDto>;
