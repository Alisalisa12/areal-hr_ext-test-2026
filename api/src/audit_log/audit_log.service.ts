import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { AuditLogEntity, EntityType } from './entities/audit_log.entity';

@Injectable()
export class AuditLogService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<AuditLogEntity[]> {
    const res: QueryResult<AuditLogEntity> = await this.pool.query(
      'SELECT * FROM audit_log ORDER BY created_at DESC',
    );
    return res.rows;
  }

  private stringifyValue(
    value: unknown,
    labels?: Record<string, string>,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const str = `${value as string | number | boolean}`;
    if (labels && labels[str]) {
      return labels[str];
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      return JSON.stringify(value);
    }

    return str;
  }

  async logChanges(
    entityId: string,
    entityType: EntityType,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    labels?: Record<string, string>,
    userId?: string,
  ): Promise<void> {
    const skipFields = ['id', 'created_at', 'updated_at', 'deleted_at'];
    const changes: (string | null)[] = [];

    for (const key in newData) {
      if (skipFields.includes(key)) continue;

      const oldVal = this.stringifyValue(oldData[key], labels);
      const newVal = this.stringifyValue(newData[key], labels);

      if (oldVal !== newVal) {
        changes.push(entityId, entityType, key, oldVal, newVal, userId ?? null);
      }
    }

    if (changes.length > 0) {
      const fieldsCount = 6;
      const rows = Array.from(
        { length: changes.length / fieldsCount },
        (_, i) => {
          const offset = i * fieldsCount;
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
        },
      );

      await this.pool.query(
        `INSERT INTO audit_log (entity_id, entity_type, field_name, old_value, new_value, user_id) 
         VALUES ${rows.join(', ')}`,
        changes,
      );
    }
  }
}
