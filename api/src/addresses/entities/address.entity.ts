export class AddressEntity {
  id!: string;
  employee_id!: string;
  region!: string;
  city!: string;
  street!: string;
  house!: string;
  block!: string | null;
  flat!: string | null;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<AddressEntity>) {
    Object.assign(this, partial);
  }
}
