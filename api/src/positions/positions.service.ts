import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { Position } from './position.interface';

@Injectable()
export class PositionsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<Position[]> {
    const res: QueryResult<Position> = await this.pool.query(
      'SELECT * FROM positions ORDER BY name ASC',
    );
    return res.rows;
  }
  async create(name: string, comment?: string): Promise<Position> {
    const res: QueryResult<Position> = await this.pool.query(
      'INSERT INTO positions (name, comment) VALUES ($1, $2) RETURNING *',
      [name, comment ?? null],
    );
    return res.rows[0];
  }
  async update(id: string, name: string, comment?: string): Promise<Position> {
    const res: QueryResult<Position> = await this.pool.query(
      'UPDATE positions SET name = $1, comment = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [name, comment ?? null, id],
    );
    return res.rows[0];
  }
  async delete(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE positions SET deleted_at = NOW() WHERE id = $1',
      [id],
    );
  }
}
