import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { HrOperationEntity } from './entities/hr_operation.entity';

@Injectable()
export class HrOperationsService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async getAll(): Promise<HrOperationEntity[]> {
    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      'SELECT * FROM hr_operations WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    return res.rows;
  }

  async create(data: Partial<HrOperationEntity>): Promise<HrOperationEntity> {
    const { employee_id, department_id, position_id, type } = data;

    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      `INSERT INTO hr_operations (employee_id, department_id, position_id, type) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [employee_id, department_id, position_id, type],
    );
    return res.rows[0];
  }

  async update(
    id: string,
    data: Partial<HrOperationEntity>,
  ): Promise<HrOperationEntity | null> {
    const { employee_id, department_id, position_id, type } = data;

    const res: QueryResult<HrOperationEntity> = await this.pool.query(
      `UPDATE hr_operations 
       SET employee_id = COALESCE($1, employee_id), 
           department_id = COALESCE($2, department_id), 
           position_id = COALESCE($3, position_id), 
           type = COALESCE($4, type),
           updated_at = NOW() 
       WHERE id = $5 AND deleted_at IS NULL 
       RETURNING *`,
      [employee_id, department_id, position_id, type, id],
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE hr_operations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}
