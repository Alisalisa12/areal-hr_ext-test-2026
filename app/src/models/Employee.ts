export interface Employee {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  birth_date: string | Date;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  position_name?: string;
  salary?: number;
  department_name?: string;
  organization_name?: string;
  hire_date?: string;
}

export interface CreateEmployeeDto {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  birth_date: string;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
