import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import {
  FullHrOperation,
  HrOperationEntity,
} from './entities/hr_operation.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreateHrOperationDto } from './dto/create-hr_operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr_operation.dto';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class HrOperationsService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<FullHrOperation[]> {
    const query = `
      SELECT 
        hro.*,
        e.last_name || ' ' || e.first_name || ' ' || COALESCE(e.middle_name, '') as employee_name,
        p.name as position_name,
        d.name as department_name,
        d.organization_id,
        org.name as organization_name,
        sc.old_salary,
        sc.new_salary,
        sc.reason as salary_reason
      FROM hr_operations hro
      LEFT JOIN employees e ON hro.employee_id = e.id
      LEFT JOIN positions p ON hro.position_id = p.id
      LEFT JOIN departments d ON hro.department_id = d.id
      LEFT JOIN organizations org ON d.organization_id = org.id
      LEFT JOIN salary_changes sc ON sc.operation_id = hro.id
      WHERE hro.deleted_at IS NULL
      ORDER BY hro.created_at DESC;
    `;
    const res: QueryResult<FullHrOperation> = await this.pool.query(query);
    return res.rows;
  }

  async getOneFull(id: string): Promise<FullHrOperation | null> {
    const query = `
      SELECT 
        hro.*,
        e.last_name || ' ' || e.first_name || ' ' || COALESCE(e.middle_name, '') as employee_name,
        p.name as position_name,
        d.name as department_name,
        d.organization_id,
        org.name as organization_name,
        sc.old_salary,
        sc.new_salary,
        sc.reason as salary_reason
      FROM hr_operations hro
      LEFT JOIN employees e ON hro.employee_id = e.id
      LEFT JOIN positions p ON hro.position_id = p.id
      LEFT JOIN departments d ON d.id = hro.department_id
      LEFT JOIN organizations org ON d.organization_id = org.id
      LEFT JOIN salary_changes sc ON sc.operation_id = hro.id
      WHERE hro.id = $1 AND hro.deleted_at IS NULL;
    `;
    const res: QueryResult<FullHrOperation> = await this.pool.query(query, [
      id,
    ]);
    return res.rows[0] || null;
  }

  async getById(id: string): Promise<HrOperationEntity | null> {
    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      'SELECT * FROM hr_operations WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(data: CreateHrOperationDto): Promise<HrOperationEntity> {
    const { employee_id, department_id, position_id, type, created_by } = data;

    const res = await this.pool.query<HrOperationEntity>(
      'INSERT INTO hr_operations (employee_id, department_id, position_id, type, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [employee_id, department_id, position_id, type, created_by],
    );
    const newOp = res.rows[0];

    const fullOp = await this.getOneFull(newOp.id);
    if (fullOp) {
      await this.auditLogService.logChanges(
        newOp.id,
        EntityType.HR_OPERATIONS,
        {},
        fullOp as unknown as Record<string, unknown>,
        {},
        created_by,
      );
    }

    return newOp;
  }

  async update(
    id: string,
    data: UpdateHrOperationDto,
    userId: string,
  ): Promise<HrOperationEntity> {
    const oldFull = await this.getOneFull(id);
    if (!oldFull) throw new NotFoundException();

    const allowedKeys = ['employee_id', 'department_id', 'position_id', 'type'];
    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdateHrOperationDto] !== undefined,
    );

    if (keys.length > 0) {
      const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
      const values = keys.map((key) => data[key as keyof UpdateHrOperationDto]);

      const res = await this.pool.query<HrOperationEntity>(
        `UPDATE hr_operations 
         SET ${setClause}, updated_at = NOW() 
         WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
         RETURNING *`,
        [...values, id],
      );

      if (!res.rows[0]) throw new NotFoundException();
    }

    const newFull = await this.getOneFull(id);
    if (!newFull) throw new NotFoundException();

    await this.auditLogService.logChanges(
      id,
      EntityType.HR_OPERATIONS,
      oldFull as unknown as Record<string, unknown>,
      newFull as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return newFull;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const oldFull = await this.getOneFull(id);
    if (!oldFull) throw new NotFoundException();

    const res = await this.pool.query(
      'UPDATE hr_operations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.HR_OPERATIONS,
        oldFull as unknown as Record<string, unknown>,
        { deleted: true },
        { true: 'Удалено' },
        userId,
      );
    }

    return deleted;
  }
}
