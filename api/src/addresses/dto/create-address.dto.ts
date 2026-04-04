export class CreateAddressDto {
  employee_id!: string;
  region!: string;
  city!: string;
  street!: string;
  house!: string;
  block?: string;
  flat?: string;
}
