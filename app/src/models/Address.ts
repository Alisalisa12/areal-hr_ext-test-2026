export interface Address {
  id: string;
  employee_id: string;
  region: string;
  city: string;
  street: string;
  house: string;
  block: string | null;
  flat: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateAddressDto {
  employee_id: string;
  region: string;
  city: string;
  street: string;
  house: string;
  block?: string;
  flat?: string;
  full_address?: string;
}

export type UpdateAddressDto = Partial<Omit<CreateAddressDto, 'employee_id'>>;
