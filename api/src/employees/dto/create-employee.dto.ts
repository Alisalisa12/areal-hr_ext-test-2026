export class CreateEmployeeDto {
  last_name!: string;
  first_name!: string;
  middle_name?: string;
  birth_date!: Date;
}
