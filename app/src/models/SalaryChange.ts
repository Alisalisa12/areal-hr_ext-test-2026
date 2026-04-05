export interface SalaryChange {
  id: string;
  operation_id: string;
  old_salary: number;
  new_salary: number;
  changed_at: string;
  reason: string;
}

export interface CreateSalaryChangeDto {
  operation_id: string;
  old_salary: number;
  new_salary: number;
  reason: string;
  changed_at?: string;
}

export type UpdateSalaryChangeDto = Partial<CreateSalaryChangeDto>;
