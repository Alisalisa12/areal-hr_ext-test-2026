export class OrganizationEntity {
  id!: string;
  name!: string;
  comment!: string | null;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<OrganizationEntity>) {
    Object.assign(this, partial);
  }
}
