import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { EmployeeEntity, FullEmployee } from './entities/employee.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<FullEmployee[]> {
    const query = `
      SELECT * FROM (
        SELECT DISTINCT ON (e.id)
          e.*, 
          p.name as position_name, 
          hro.created_at as hire_date, 
          d.name as department_name, 
          org.name as organization_name, 
          sc.new_salary as salary
        FROM employees e
        LEFT JOIN hr_operations hro ON hro.employee_id = e.id
        LEFT JOIN positions p ON p.id = hro.position_id
        LEFT JOIN departments d ON d.id = hro.department_id
        LEFT JOIN organizations org ON org.id = d.organization_id
        LEFT JOIN salary_changes sc ON sc.operation_id = hro.id
        WHERE e.deleted_at IS NULL
        ORDER BY e.id, hro.created_at DESC, sc.changed_at DESC
      ) AS subquery
      ORDER BY created_at DESC;
    `;
    const res: QueryResult<FullEmployee> =
      await this.pool.query<FullEmployee>(query);
    return res.rows;
  }

  async getById(id: string): Promise<EmployeeEntity | null> {
    const res: QueryResult<EmployeeEntity> = await this.pool.query(
      'SELECT * FROM employees WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0];
  }

  async create(
    data: Partial<CreateEmployeeDto>,
    userId: string,
  ): Promise<EmployeeEntity> {
    const { last_name, first_name, middle_name, birth_date } = data;

    const res: QueryResult<EmployeeEntity> = await this.pool.query(
      `INSERT INTO employees (last_name, first_name, middle_name, birth_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [last_name, first_name, middle_name ?? null, birth_date],
    );

    const newEmp = res.rows[0];

    await this.auditLogService.logChanges(
      newEmp.id,
      EntityType.EMPLOYEES,
      {},
      newEmp as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return newEmp;
  }

  async update(
    id: string,
    data: UpdateEmployeeDto,
    userId: string,
  ): Promise<EmployeeEntity> {
    const oldEmp = await this.getById(id);
    if (!oldEmp) {
      throw new NotFoundException();
    }

    const allowedKeys = [
      'last_name',
      'first_name',
      'middle_name',
      'birth_date',
    ];

    const keys = Object.keys(data).filter(
      (key) => allowedKeys.includes(key) && data[key] !== undefined,
    );

    if (keys.length === 0) return oldEmp;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');

    const values = keys.map((key) => {
      const value = data[key as keyof UpdateEmployeeDto];
      return value as string | number | boolean | Date | null;
    });

    const res = await this.pool.query<EmployeeEntity>(
      `UPDATE employees SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL RETURNING *`,
      [...values, id],
    );

    const updatedEmp = res.rows[0];

    if (!updatedEmp) {
      throw new NotFoundException();
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.EMPLOYEES,
      oldEmp as unknown as Record<string, unknown>,
      updatedEmp as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return updatedEmp;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const oldEmp = await this.getById(id);

    const res = await this.pool.query(
      'UPDATE employees SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    if (res.rowCount === 0) {
      throw new NotFoundException();
    }

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted && oldEmp) {
      await this.auditLogService.logChanges(
        id,
        EntityType.EMPLOYEES,
        {
          deleted: `${oldEmp.last_name} ${oldEmp.first_name} ${oldEmp.middle_name ?? ''}`,
        },
        { deleted: true },
        { true: 'Уволен' },
        userId,
      );
    }
    return deleted;
  }
}
