export enum EntityType {
  ORGANIZATIONS = 'organizations',
  DEPARTMENTS = 'departments',
  POSITIONS = 'positions',
  EMPLOYEES = 'employees',
  FILES = 'files',
  ADDRESSES = 'addresses',
  PASSPORTS = 'passports',
  HR_OPERATIONS = 'hr_operations',
  SALARY_CHANGES = 'salary_changes',
}

export const EntityTypeLabels: Record<EntityType, string> = {
  [EntityType.ORGANIZATIONS]: 'Организация',
  [EntityType.DEPARTMENTS]: 'Отдел',
  [EntityType.POSITIONS]: 'Должность',
  [EntityType.EMPLOYEES]: 'Сотрудник',
  [EntityType.FILES]: 'Файл',
  [EntityType.ADDRESSES]: 'Адрес',
  [EntityType.PASSPORTS]: 'Паспорт',
  [EntityType.HR_OPERATIONS]: 'HR операция',
  [EntityType.SALARY_CHANGES]: 'Изменение зарплаты',
};

export interface AuditLog {
  id: string;
  entity_id: string;
  entity_type: EntityType;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface CreateAuditLogDto {
  entity_id: string;
  entity_type: EntityType;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
}

export type UpdateAuditLogDto = Partial<CreateAuditLogDto>;
