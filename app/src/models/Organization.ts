export interface Organization {
  id: string;
  name: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateOrganizationDto {
  name: string;
  comment?: string;
}

export type UpdateOrganizationDto = Partial<CreateOrganizationDto>;
