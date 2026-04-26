import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { PassportEntity } from './entities/passport.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';

@Injectable()
export class PassportsService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

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

  async getById(id: string): Promise<PassportEntity | null> {
    const res: QueryResult<PassportEntity> = await this.pool.query(
      'SELECT * FROM passports WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(
    data: CreatePassportDto,
    userId: string,
  ): Promise<PassportEntity> {
    const { employee_id, series, number, issue_date, issuer_code, issued_by } =
      data;
    const res: QueryResult<PassportEntity> = await this.pool.query(
      `INSERT INTO passports (employee_id, series, number, issue_date, issuer_code, issued_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [employee_id, series, number, issue_date, issuer_code, issued_by],
    );

    const newPassport = res.rows[0];

    await this.auditLogService.logChanges(
      newPassport.id,
      EntityType.PASSPORTS,
      {},
      newPassport as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return newPassport;
  }

  async update(
    id: string,
    data: UpdatePassportDto,
    userId: string,
  ): Promise<PassportEntity> {
    const oldPassport = await this.getById(id);
    if (!oldPassport) {
      throw new NotFoundException();
    }

    const allowedKeys = [
      'series',
      'number',
      'issue_date',
      'issuer_code',
      'issued_by',
    ];
    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdatePassportDto] !== undefined,
    );

    if (keys.length === 0) return oldPassport;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdatePassportDto]);

    const res = await this.pool.query<PassportEntity>(
      `UPDATE passports 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
       RETURNING *`,
      [...values, id],
    );

    const updatedPassport = res.rows[0];
    if (!updatedPassport) {
      throw new NotFoundException();
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.PASSPORTS,
      oldPassport as unknown as Record<string, unknown>,
      updatedPassport as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return updatedPassport;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const oldPassport = await this.getById(id);
    if (!oldPassport) {
      throw new NotFoundException();
    }

    const res = await this.pool.query(
      'UPDATE passports SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.PASSPORTS,
        { deleted: `${oldPassport.series} ${oldPassport.number}` },
        { deleted: true },
        { true: 'Удалено' },
        userId,
      );
    }

    return deleted;
  }
}
