export class SalaryChangeEntity {
  id!: string;
  operation_id!: string;
  old_salary!: number;
  new_salary!: number;
  changed_at!: Date;
  reason!: string;

  constructor(partial: Partial<SalaryChangeEntity>) {
    Object.assign(this, partial);
  }
}
