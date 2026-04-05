import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { EmployeeEntity } from './entities/employee.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<EmployeeEntity[]> {
    const res: QueryResult<EmployeeEntity> = await this.pool.query(
      `SELECT * FROM employees 
       WHERE deleted_at IS NULL 
       ORDER BY last_name ASC, first_name ASC`,
    );
    return res.rows;
  }

  async create(data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    const { last_name, first_name, middle_name, birth_date } = data;

    const res: QueryResult<EmployeeEntity> = await this.pool.query(
      `INSERT INTO employees (last_name, first_name, middle_name, birth_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [last_name, first_name, middle_name ?? null, birth_date],
    );

    const newEmp = res.rows[0];

    await this.auditLogService.logChanges(newEmp.id, EntityType.EMPLOYEES, {}, {
      last_name: newEmp.last_name,
      first_name: newEmp.first_name,
      middle_name: newEmp.middle_name,
      birth_date: newEmp.birth_date,
    } as unknown as Record<string, unknown>);

    return newEmp;
  }

  async update(
    id: string,
    data: Partial<EmployeeEntity>,
  ): Promise<EmployeeEntity | null> {
    const oldEmp = await this.getById(id);
    if (!oldEmp) return null;

    const { last_name, first_name, middle_name, birth_date } = data;

    const res: QueryResult<EmployeeEntity> = await this.pool.query(
      `UPDATE employees 
       SET 
        last_name = COALESCE($1, last_name),
        first_name = COALESCE($2, first_name),
        middle_name = COALESCE($3, middle_name),
        birth_date = COALESCE($4, birth_date),
        updated_at = NOW() 
       WHERE id = $5 AND deleted_at IS NULL 
       RETURNING *`,
      [
        last_name ?? null,
        first_name ?? null,
        middle_name ?? null,
        birth_date ?? null,
        id,
      ],
    );

    const updatedEmp = res.rows[0] || null;

    if (updatedEmp) {
      await this.auditLogService.logChanges(
        id,
        EntityType.EMPLOYEES,
        oldEmp as unknown as Record<string, unknown>,
        updatedEmp as unknown as Record<string, unknown>,
      );
    }

    return updatedEmp;
  }

  async delete(id: string): Promise<boolean> {
    const oldEmp = await this.getById(id);

    const res = await this.pool.query(
      'UPDATE employees SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted && oldEmp) {
      await this.auditLogService.create({
        entity_id: id,
        entity_type: EntityType.EMPLOYEES,
        field_name: 'deleted',
        old_value: `${oldEmp.last_name} ${oldEmp.first_name}`,
        new_value: 'удалено',
      });
    }

    return deleted;
  }

  async getById(id: string): Promise<EmployeeEntity | null> {
    const res: QueryResult<EmployeeEntity> = await this.pool.query(
      'SELECT * FROM employees WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0];
  }
}
