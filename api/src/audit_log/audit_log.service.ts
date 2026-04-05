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

  async create(data: Partial<AuditLogEntity>): Promise<AuditLogEntity> {
    const { entity_id, entity_type, field_name, old_value, new_value } = data;

    const res: QueryResult<AuditLogEntity> = await this.pool.query(
      `INSERT INTO audit_log (entity_id, entity_type, field_name, old_value, new_value) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [entity_id, entity_type, field_name, old_value, new_value],
    );
    return res.rows[0];
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
  ): Promise<void> {
    const skipFields = ['id', 'created_at', 'updated_at', 'deleted_at'];

    for (const key in newData) {
      if (skipFields.includes(key)) continue;

      const oldVal = this.stringifyValue(oldData[key], labels);
      const newVal = this.stringifyValue(newData[key], labels);

      if (oldVal !== newVal) {
        await this.create({
          entity_id: entityId,
          entity_type: entityType,
          field_name: key,
          old_value: oldVal,
          new_value: newVal,
        });
      }
    }
  }

  async update(
    id: string,
    data: Partial<AuditLogEntity>,
  ): Promise<AuditLogEntity | null> {
    const { entity_id, entity_type, field_name, old_value, new_value } = data;

    const res: QueryResult<AuditLogEntity> = await this.pool.query(
      `UPDATE audit_log 
       SET entity_id = COALESCE($1, entity_id), 
           entity_type = COALESCE($2, entity_type), 
           field_name = COALESCE($3, field_name),
           old_value = COALESCE($4, old_value),
           new_value = COALESCE($5, new_value)
       WHERE id = $6 
       RETURNING *`,
      [entity_id, entity_type, field_name, old_value, new_value, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM audit_log WHERE id = $1', [
      id,
    ]);
    return (res.rowCount ?? 0) > 0;
  }
}
