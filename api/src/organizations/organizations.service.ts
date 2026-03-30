import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { Organization } from './organization.interface';

@Injectable()
export class OrganizationsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<Organization[]> {
    const res: QueryResult<Organization> = await this.pool.query(
      'SELECT * FROM organizations ORDER BY name ASC',
    );
    return res.rows;
  }
  async create(name: string, comment?: string): Promise<Organization> {
    const res: QueryResult<Organization> = await this.pool.query(
      'INSERT INTO organizations (name, comment) VALUES ($1, $2) RETURNING *',
      [name, comment ?? null],
    );
    return res.rows[0];
  }
  async update(
    id: string,
    name: string,
    comment?: string,
  ): Promise<Organization> {
    const res: QueryResult<Organization> = await this.pool.query(
      'UPDATE organizations SET name = $1, comment = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [name, comment ?? null, id],
    );
    return res.rows[0];
  }
  async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE organizations SET deleted_at = NOW() WHERE id = $1',
      [id],
    );
  }
}
