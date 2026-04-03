import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { OrganizationEntity } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<OrganizationEntity[]> {
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'SELECT * FROM organizations WHERE deleted_at IS NULL ORDER BY name ASC',
    );
    return res.rows;
  }

  async create(data: Partial<OrganizationEntity>): Promise<OrganizationEntity> {
    const { name, comment } = data;
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'INSERT INTO organizations (name, comment) VALUES ($1, $2) RETURNING *',
      [name, comment ?? null],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    data: Partial<OrganizationEntity>,
  ): Promise<OrganizationEntity | null> {
    const { name, comment } = data;
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'UPDATE organizations SET name = $1, comment = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [name, comment ?? null, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE organizations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
