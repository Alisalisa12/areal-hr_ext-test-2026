export interface Employee {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  birth_date: string | Date;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateEmployeeDto {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  birth_date: string;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
