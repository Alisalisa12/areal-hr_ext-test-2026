export enum HrOperationType {
  HIRE = 'hire',
  TRANSFER = 'transfer',
  SALARY_CHANGE = 'salary_change',
  FIRE = 'fire',
}
export class HrOperationEntity {
  id!: string;
  employee_id!: string;
  department_id!: string;
  position_id!: string;

  type!: HrOperationType;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<HrOperationEntity>) {
    Object.assign(this, partial);
  }
}
