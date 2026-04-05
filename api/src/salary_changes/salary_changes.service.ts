import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { SalaryChangeEntity } from './entities/salary_change.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

@Injectable()
export class SalaryChangesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<SalaryChangeEntity[]> {
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      'SELECT * FROM salary_changes ORDER BY changed_at DESC',
    );
    return res.rows;
  }

  async create(data: Partial<SalaryChangeEntity>): Promise<SalaryChangeEntity> {
    const { operation_id, old_salary, new_salary, reason, changed_at } = data;
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      `INSERT INTO salary_changes (operation_id, old_salary, new_salary, reason, changed_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [operation_id, old_salary, new_salary, reason, changed_at ?? new Date()],
    );

    const created = res.rows[0];

    await this.auditLogService.logChanges(
      created.id,
      EntityType.SALARY_CHANGES,
      {},
      created as unknown as Record<string, unknown>,
    );

    return created;
  }

  async update(
    id: string,
    data: Partial<SalaryChangeEntity>,
  ): Promise<SalaryChangeEntity | null> {
    const oldRes: QueryResult<SalaryChangeEntity> = await this.pool.query(
      'SELECT * FROM salary_changes WHERE id = $1',
      [id],
    );
    const oldRecord = oldRes.rows[0];
    if (!oldRecord) return null;

    const { operation_id, old_salary, new_salary, reason, changed_at } = data;
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      `UPDATE salary_changes 
       SET operation_id = $1, old_salary = $2, new_salary = $3, reason = $4, changed_at = $5
       WHERE id = $6 
       RETURNING *`,
      [operation_id, old_salary, new_salary, reason, changed_at, id],
    );

    const updated = res.rows[0] ?? null;

    if (updated) {
      await this.auditLogService.logChanges(
        id,
        EntityType.SALARY_CHANGES,
        oldRecord as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>,
      );
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'DELETE FROM salary_changes WHERE id = $1',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
