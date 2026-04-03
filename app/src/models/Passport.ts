export interface Passport {
  id: string;
  employee_id: string;
  series: string;
  number: string;
  issue_date: string;
  issuer_code: string;
  issued_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreatePassportDto {
  employee_id: string;
  series: string;
  number: string;
  issue_date: string;
  issuer_code: string;
  issued_by: string;
  full_passport?: string;
}

export type UpdatePassportDto = Partial<Omit<CreatePassportDto, 'employee_id'>>;
