export class UserEntity {
  id!: string;
  role_id!: string;
  employee_id!: string;
  login!: string;
  password_hash!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

export interface UserWithDetails extends UserEntity {
  role_name: string | null;
  employee_fio: string;
}
