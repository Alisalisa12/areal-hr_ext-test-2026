import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { DepartmentEntity } from './entities/department.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(): Promise<DepartmentEntity[]> {
    const res: QueryResult<DepartmentEntity> = await this.pool.query(
      'SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY name ASC',
    );
    return res.rows;
  }

  async getByOrg(orgId: string): Promise<DepartmentEntity[]> {
    const res: QueryResult<DepartmentEntity> = await this.pool.query(
      'SELECT * FROM departments WHERE organization_id = $1 AND deleted_at IS NULL ORDER BY name ASC',
      [orgId],
    );
    return res.rows;
  }

  async getById(id: string): Promise<DepartmentEntity | null> {
    const res: QueryResult<DepartmentEntity> = await this.pool.query(
      'SELECT * FROM departments WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(
    data: CreateDepartmentDto,
    userId: string,
  ): Promise<DepartmentEntity> {
    const { name, organization_id, parent_id } = data;
    const res: QueryResult<DepartmentEntity> = await this.pool.query(
      `INSERT INTO departments (name, organization_id, parent_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, organization_id, parent_id ?? null],
    );

    const newDept = res.rows[0];
    await this.auditLogService.logChanges(
      newDept.id,
      EntityType.DEPARTMENTS,
      {},
      newDept as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return newDept;
  }

  async update(
    id: string,
    data: UpdateDepartmentDto,
    userId: string,
  ): Promise<DepartmentEntity> {
    const oldDept = await this.getById(id);
    if (!oldDept) {
      throw new NotFoundException();
    }

    const allowedKeys = ['name', 'parent_id'];
    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdateDepartmentDto] !== undefined,
    );

    if (keys.length === 0) return oldDept;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdateDepartmentDto]);

    const res = await this.pool.query<DepartmentEntity>(
      `UPDATE departments 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
       RETURNING *`,
      [...values, id],
    );

    const updatedDept = res.rows[0];
    if (!updatedDept) {
      throw new NotFoundException();
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.DEPARTMENTS,
      oldDept as unknown as Record<string, unknown>,
      updatedDept as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return updatedDept;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const oldDept = await this.getById(id);
    if (!oldDept) {
      throw new NotFoundException();
    }

    const res = await this.pool.query(
      'UPDATE departments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.DEPARTMENTS,
        { deleted: oldDept.name },
        { deleted: true },
        { true: 'Удалено' },
        userId,
      );
    }

    return deleted;
  }
}
