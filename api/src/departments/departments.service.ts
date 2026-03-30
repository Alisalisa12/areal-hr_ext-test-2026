import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { Department } from './departments.interface';

@Injectable()
export class DepartmentsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getByOrg(orgId: string): Promise<Department[]> {
    const res: QueryResult<Department> = await this.pool.query(
      `SELECT * FROM departments 
       WHERE organization_id = $1
       ORDER BY name ASC`,
      [orgId],
    );
    return res.rows;
  }

  async create(
    organization_id: string,
    name: string,
    comment?: string,
    parent_id?: string,
  ): Promise<Department> {
    const res: QueryResult<Department> = await this.pool.query(
      `INSERT INTO departments (organization_id, name, comment, parent_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [organization_id, name, comment ?? null, parent_id ?? null],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    name: string,
    comment?: string,
    parent_id?: string | null,
  ): Promise<Department> {
    const res: QueryResult<Department> = await this.pool.query(
      'UPDATE departments SET name = $1, comment = $2, parent_id = $3, updated_at = NOW() WHERE id = $4 AND deleted_at IS NULL RETURNING *',
      [name, comment ?? null, parent_id ?? null, id],
    );
    return res.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE departments SET deleted_at = NOW() WHERE id = $1',
      [id],
    );
  }
}
