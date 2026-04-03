export class CreatePassportDto {
  employee_id!: string;
  series!: string;
  number!: string;
  issue_date!: Date;
  issuer_code!: string;
  issued_by!: string;
}
