export class UpdateEmployeeDto {
  last_name?: string;
  first_name?: string;
  middle_name?: string | null;
  birth_date?: string | Date;
}
