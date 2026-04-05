import { EntityType } from '../entities/audit_log.entity';

export class CreateAuditLogDto {
  entity_id!: string;
  entity_type!: EntityType;
  field_name!: string;
  old_value!: string | null;
  new_value!: string | null;
}
