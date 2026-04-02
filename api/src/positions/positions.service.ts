import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { PositionEntity } from './entities/position.entity';

@Injectable()
export class PositionsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<PositionEntity[]> {
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'SELECT * FROM positions WHERE deleted_at IS NULL ORDER BY name ASC',
    );
    return res.rows;
  }
  async create(data: Partial<PositionEntity>): Promise<PositionEntity> {
    const { name, comment } = data;
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'INSERT INTO positions (name, comment) VALUES ($1, $2) RETURNING *',
      [name, comment ?? null],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    data: Partial<PositionEntity>,
  ): Promise<PositionEntity | null> {
    const { name, comment } = data;
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'UPDATE positions SET name = $1, comment = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [name, comment ?? null, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE positions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
