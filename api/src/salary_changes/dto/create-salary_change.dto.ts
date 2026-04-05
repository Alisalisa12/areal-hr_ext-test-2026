export class CreateSalaryChangeDto {
  operation_id!: string;
  old_salary!: number;
  new_salary!: number;
  reason!: string;
  changed_at?: Date;
}
