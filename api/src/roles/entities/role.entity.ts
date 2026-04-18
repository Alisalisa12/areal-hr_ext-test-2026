export class RoleEntity {
  id!: string;
  name!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<RoleEntity>) {
    Object.assign(this, partial);
  }
}
