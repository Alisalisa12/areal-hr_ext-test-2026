import { Injectable, Inject } from '@nestjs/common';
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

  async create(data: CreateDepartmentDto): Promise<DepartmentEntity> {
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
      {
        name: newDept.name,
        organization_id: newDept.organization_id,
        parent_id: newDept.parent_id,
      } as unknown as Record<string, unknown>,
    );

    return newDept;
  }

  async update(
    id: string,
    data: UpdateDepartmentDto,
  ): Promise<DepartmentEntity | null> {
    const oldDept = await this.getById(id);
    if (!oldDept) return null;

    const { name, parent_id } = data;
    const res: QueryResult<DepartmentEntity> = await this.pool.query(
      `UPDATE departments 
       SET name = COALESCE($1, name), 
           parent_id = COALESCE($2, parent_id), 
           updated_at = NOW() 
       WHERE id = $3 AND deleted_at IS NULL RETURNING *`,
      [name ?? null, parent_id ?? null, id],
    );

    const updatedDept = res.rows[0] || null;

    if (updatedDept) {
      await this.auditLogService.logChanges(
        id,
        EntityType.DEPARTMENTS,
        oldDept as unknown as Record<string, unknown>,
        updatedDept as unknown as Record<string, unknown>,
      );
    }

    return updatedDept;
  }

  async delete(id: string): Promise<boolean> {
    const oldDept = await this.getById(id);
    const res = await this.pool.query(
      'UPDATE departments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted && oldDept) {
      await this.auditLogService.create({
        entity_id: id,
        entity_type: EntityType.DEPARTMENTS,
        field_name: 'deleted',
        old_value: oldDept.name,
        new_value: 'удалено',
      });
    }

    return deleted;
  }
}
