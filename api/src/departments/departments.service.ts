import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { DepartmentEntity } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

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

  async create(data: Partial<DepartmentEntity>): Promise<DepartmentEntity> {
    const { organization_id, name, comment, parent_id } = data;
    const res: QueryResult<DepartmentEntity> = await this.pool.query(
      'INSERT INTO departments (organization_id, name, comment, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [organization_id, name, comment ?? null, parent_id ?? null],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    data: Partial<DepartmentEntity>,
  ): Promise<DepartmentEntity | null> {
    const { name, comment, parent_id } = data;
    const res: QueryResult<DepartmentEntity> = await this.pool.query(
      'UPDATE departments SET name = $1, comment = $2, parent_id = $3, updated_at = NOW() WHERE id = $4 AND deleted_at IS NULL RETURNING *',
      [name, comment ?? null, parent_id ?? null, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE departments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
