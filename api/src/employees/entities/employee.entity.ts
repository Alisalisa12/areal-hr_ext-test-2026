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

export type FullEmployee = EmployeeEntity & {
  position_name: string | null;
  hire_date: Date | null;
  department_name: string | null;
  organization_name: string | null;
  salary: number | null;
};
