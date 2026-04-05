import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { SalaryChangeEntity } from './entities/salary_change.entity';

@Injectable()
export class SalaryChangesService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<SalaryChangeEntity[]> {
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      'SELECT * FROM salary_changes ORDER BY changed_at DESC',
    );
    return res.rows;
  }

  async create(data: Partial<SalaryChangeEntity>): Promise<SalaryChangeEntity> {
    const { operation_id, old_salary, new_salary, reason, changed_at } = data;
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      `INSERT INTO salary_changes (operation_id, old_salary, new_salary, reason, changed_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [operation_id, old_salary, new_salary, reason, changed_at ?? new Date()],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    data: Partial<SalaryChangeEntity>,
  ): Promise<SalaryChangeEntity | null> {
    const { operation_id, old_salary, new_salary, reason, changed_at } = data;
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      `UPDATE salary_changes 
       SET operation_id = $1, old_salary = $2, new_salary = $3, reason = $4, changed_at = $5
       WHERE id = $6 
       RETURNING *`,
      [operation_id, old_salary, new_salary, reason, changed_at, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'DELETE FROM salary_changes WHERE id = $1',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
