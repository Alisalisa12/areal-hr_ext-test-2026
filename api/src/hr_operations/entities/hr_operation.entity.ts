export enum HrOperationType {
  HIRE = 'hire',
  TRANSFER = 'transfer',
  SALARY_CHANGE = 'salary_change',
  FIRE = 'fire',
}
export class HrOperationEntity {
  id!: string;
  user_login?: string;
  employee_id!: string;
  department_id!: string;
  position_id!: string;
  created_by!: string;
  type!: HrOperationType;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<HrOperationEntity>) {
    Object.assign(this, partial);
  }
}

export type FullHrOperation = HrOperationEntity & {
  employee_name: string;
  position_name: string;
  department_name: string;
  organization_id: string;
  organization_name: string;
  old_salary: number | null;
  new_salary: number | null;
  salary_reason: string | null;
};
