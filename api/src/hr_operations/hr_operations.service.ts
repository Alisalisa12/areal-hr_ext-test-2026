import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { HrOperationEntity } from './entities/hr_operation.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

@Injectable()
export class HrOperationsService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async getLabels(): Promise<Record<string, string>> {
    const labels: Record<string, string> = {
      hire: 'Приём на работу',
      transfer: 'Перевод',
      salary_change: 'Изменение зарплаты',
      fire: 'Увольнение',
    };

    const emps = await this.pool.query<{
      id: string;
      last_name: string;
      first_name: string;
    }>('SELECT id, last_name, first_name FROM employees');
    emps.rows.forEach((r) => (labels[r.id] = `${r.last_name} ${r.first_name}`));

    const depts = await this.pool.query<{ id: string; name: string }>(
      'SELECT id, name FROM departments',
    );
    depts.rows.forEach((r) => (labels[r.id] = r.name));

    const pos = await this.pool.query<{ id: string; name: string }>(
      'SELECT id, name FROM positions',
    );
    pos.rows.forEach((r) => (labels[r.id] = r.name));

    return labels;
  }

  async getAll(): Promise<HrOperationEntity[]> {
    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      'SELECT * FROM hr_operations WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    return res.rows;
  }

  async create(data: Partial<HrOperationEntity>): Promise<HrOperationEntity> {
    const { employee_id, department_id, position_id, type } = data;
    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      'INSERT INTO hr_operations (employee_id, department_id, position_id, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [employee_id, department_id, position_id, type],
    );

    const newOp = res.rows[0];
    const labels = await this.getLabels();

    await this.auditLogService.create({
      entity_id: newOp.id,
      entity_type: EntityType.HR_OPERATIONS,
      field_name: labels[newOp.type] ?? newOp.type,
      old_value: null,
      new_value: [
        labels[newOp.employee_id] ?? newOp.employee_id,
        labels[newOp.department_id] ?? newOp.department_id,
        labels[newOp.position_id] ?? newOp.position_id,
      ]
        .filter(Boolean)
        .join(' | '),
    });

    return newOp;
  }

  async update(
    id: string,
    data: Partial<HrOperationEntity>,
  ): Promise<HrOperationEntity | null> {
    const oldRes: QueryResult<HrOperationEntity> = await this.pool.query(
      'SELECT * FROM hr_operations WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    const oldOp = oldRes.rows[0];
    if (!oldOp) return null;

    const { employee_id, department_id, position_id, type } = data;
    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      `UPDATE hr_operations 
       SET employee_id = COALESCE($1, employee_id), 
           department_id = COALESCE($2, department_id), 
           position_id = COALESCE($3, position_id), 
           type = COALESCE($4, type), 
           updated_at = NOW() 
       WHERE id = $5 AND deleted_at IS NULL RETURNING *`,
      [employee_id, department_id, position_id, type, id],
    );

    const updatedOp = res.rows[0];
    const labels = await this.getLabels();

    if (updatedOp) {
      await this.auditLogService.logChanges(
        id,
        EntityType.HR_OPERATIONS,
        oldOp as unknown as Record<string, unknown>,
        updatedOp as unknown as Record<string, unknown>,
        labels,
      );
    }

    return updatedOp;
  }

  async delete(id: string): Promise<boolean> {
    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      'UPDATE hr_operations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [id],
    );

    if ((res.rowCount ?? 0) > 0) {
      const oldOp = res.rows[0];
      const labels = await this.getLabels();

      await this.auditLogService.create({
        entity_id: id,
        entity_type: EntityType.HR_OPERATIONS,
        field_name: 'deleted',
        old_value: [
          labels[oldOp.type] ?? oldOp.type,
          labels[oldOp.employee_id] ?? oldOp.employee_id,
        ].join(' | '),
        new_value: 'удалено',
      });

      return true;
    }
    return false;
  }
}
