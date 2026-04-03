export class PassportEntity {
  id!: string;
  employee_id!: string;
  series!: string;
  number!: string;
  issue_date!: Date;
  issuer_code!: string;
  issued_by!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<PassportEntity>) {
    Object.assign(this, partial);
  }
}
