export enum HrOperationType {
  HIRE = 'hire',
  TRANSFER = 'transfer',
  SALARY_CHANGE = 'salary_change',
  FIRE = 'fire',
}

export const HrOperationTypeLabels: Record<HrOperationType, string> = {
  [HrOperationType.HIRE]: 'Приём на работу',
  [HrOperationType.TRANSFER]: 'Перевод',
  [HrOperationType.SALARY_CHANGE]: 'Изменение зарплаты',
  [HrOperationType.FIRE]: 'Увольнение',
};

export interface HrOperation {
  id: string;
  user_login?: string;
  employee_id: string;
  department_id: string;
  position_id: string;
  type: HrOperationType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  employee_name?: string;
  position_name?: string;
  department_name?: string;
  organization_name?: string;
  old_salary?: number | null;
  new_salary?: number | null;
  salary_reason?: string | null;
}

export interface CreateHrOperationDto {
  employee_id: string;
  department_id: string;
  position_id: string;
  type: HrOperationType;
}

export type UpdateHrOperationDto = Partial<CreateHrOperationDto>;
