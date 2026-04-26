export enum EntityType {
  ORGANIZATIONS = 'organizations',
  DEPARTMENTS = 'departments',
  POSITIONS = 'positions',
  EMPLOYEES = 'employees',
  FILES = 'files',
  FILE_CATEGORIES = 'file_categories',
  ADDRESSES = 'addresses',
  PASSPORTS = 'passports',
  HR_OPERATIONS = 'hr_operations',
  SALARY_CHANGES = 'salary_changes',
  USERS = 'users',
  ROLES = 'roles',
}

export class AuditLogEntity {
  id!: string;
  user_id!: string | null;
  entity_id!: string;
  entity_type!: EntityType;
  field_name!: string;
  old_value!: string | null;
  new_value!: string | null;
  created_at!: Date;

  constructor(partial: Partial<AuditLogEntity>) {
    Object.assign(this, partial);
  }
}
