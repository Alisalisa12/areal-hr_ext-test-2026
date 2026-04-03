export class EmployeeEntity {
  id!: string;
  last_name!: string;
  first_name!: string;
  middle_name!: string | null;
  birth_date!: Date;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<EmployeeEntity>) {
    Object.assign(this, partial);
  }
}
