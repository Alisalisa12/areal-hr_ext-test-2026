export interface Department {
  id: string;
  organization_id: string;
  parent_id: string | null;
  name: string;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateDepartmentDto {
  organization_id: string;
  parent_id?: string | null;
  name: string;
  comment?: string;
}

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;
