import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { AddressEntity } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<AddressEntity[]> {
    const res: QueryResult<AddressEntity> = await this.pool.query(
      'SELECT * FROM addresses WHERE deleted_at IS NULL ORDER BY created_at ASC',
    );
    return res.rows;
  }

  async getByEmployee(employeeId: string): Promise<AddressEntity[]> {
    const res: QueryResult<AddressEntity> = await this.pool.query(
      'SELECT * FROM addresses WHERE employee_id = $1 AND deleted_at IS NULL',
      [employeeId],
    );
    return res.rows;
  }

  async create(data: Partial<AddressEntity>): Promise<AddressEntity> {
    const { employee_id, region, city, street, house, block, flat } = data;
    const res: QueryResult<AddressEntity> = await this.pool.query(
      `INSERT INTO addresses (employee_id, region, city, street, house, block, flat)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [employee_id, region, city, street, house, block, flat],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    data: Partial<AddressEntity>,
  ): Promise<AddressEntity | null> {
    const { region, city, street, house, block, flat } = data;
    const res: QueryResult<AddressEntity> = await this.pool.query(
      `UPDATE addresses
       SET region = COALESCE($1, region),
           city = COALESCE($2, city),
           street = COALESCE($3, street),
           house = COALESCE($4, house),
           block = COALESCE($5, block),
           flat = COALESCE($6, flat),
           updated_at = NOW()
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [region, city, street, house, block, flat, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE addresses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
