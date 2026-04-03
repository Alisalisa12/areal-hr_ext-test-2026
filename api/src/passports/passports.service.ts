import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { PassportEntity } from './entities/passport.entity';

@Injectable()
export class PassportsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<PassportEntity[]> {
    const res: QueryResult<PassportEntity> = await this.pool.query(
      'SELECT * FROM passports WHERE deleted_at IS NULL ORDER BY created_at ASC',
    );
    return res.rows;
  }

  async getByEmployee(employeeId: string): Promise<PassportEntity | null> {
    const res: QueryResult<PassportEntity> = await this.pool.query(
      'SELECT * FROM passports WHERE employee_id = $1 AND deleted_at IS NULL',
      [employeeId],
    );
    return res.rows[0] || null;
  }

  async create(data: Partial<PassportEntity>): Promise<PassportEntity> {
    const { employee_id, series, number, issue_date, issuer_code, issued_by } =
      data;
    const res: QueryResult<PassportEntity> = await this.pool.query(
      `INSERT INTO passports (employee_id, series, number, issue_date, issuer_code, issued_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [employee_id, series, number, issue_date, issuer_code, issued_by],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    data: Partial<PassportEntity>,
  ): Promise<PassportEntity | null> {
    const { series, number, issue_date, issuer_code, issued_by } = data;
    const res: QueryResult<PassportEntity> = await this.pool.query(
      `UPDATE passports
       SET series = COALESCE($1, series),
           number = COALESCE($2, number),
           issue_date = COALESCE($3, issue_date),
           issuer_code = COALESCE($4, issuer_code),
           issued_by = COALESCE($5, issued_by),
           updated_at = NOW()
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [series, number, issue_date, issuer_code, issued_by, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE passports SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
