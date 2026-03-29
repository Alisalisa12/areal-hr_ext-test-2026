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
  async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE organizations SET deleted_at = NOW() WHERE id = $1',
      [id],
    );
  }
}
