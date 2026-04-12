import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { SalaryChangeEntity } from './entities/salary_change.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreateSalaryChangeDto } from './dto/create-salary_change.dto';
import { UpdateSalaryChangeDto } from './dto/update-salary_change.dto';

@Injectable()
export class SalaryChangesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<SalaryChangeEntity[]> {
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      'SELECT * FROM salary_changes ORDER BY changed_at DESC',
    );
    return res.rows;
  }

  async getById(id: string): Promise<SalaryChangeEntity | null> {
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      'SELECT * FROM salary_changes WHERE id = $1',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(data: CreateSalaryChangeDto): Promise<SalaryChangeEntity> {
    const { operation_id, old_salary, new_salary, reason, changed_at } = data;
    const res: QueryResult<SalaryChangeEntity> = await this.pool.query(
      `INSERT INTO salary_changes (operation_id, old_salary, new_salary, reason, changed_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [operation_id, old_salary, new_salary, reason, changed_at ?? new Date()],
    );

    const created = res.rows[0];

    await this.auditLogService.logChanges(
      created.id,
      EntityType.SALARY_CHANGES,
      {},
      created as unknown as Record<string, unknown>,
    );

    return created;
  }

  async update(
    id: string,
    data: UpdateSalaryChangeDto,
  ): Promise<SalaryChangeEntity> {
    const oldRecord = await this.getById(id);
    if (!oldRecord) {
      throw new NotFoundException(
        `Запись об изменении зарплаты с ID ${id} не найдена`,
      );
    }

    const allowedKeys = [
      'operation_id',
      'old_salary',
      'new_salary',
      'reason',
      'changed_at',
    ];

    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdateSalaryChangeDto] !== undefined,
    );

    if (keys.length === 0) return oldRecord;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdateSalaryChangeDto]);

    const res = await this.pool.query<SalaryChangeEntity>(
      `UPDATE salary_changes 
       SET ${setClause}
       WHERE id = $${keys.length + 1} 
       RETURNING *`,
      [...values, id],
    );

    const updated = res.rows[0];
    if (!updated) {
      throw new NotFoundException(`Не удалось обновить запись`);
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.SALARY_CHANGES,
      oldRecord as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const oldRecord = await this.getById(id);
    if (!oldRecord) {
      throw new NotFoundException(`Запись не найдена`);
    }

    const res = await this.pool.query(
      'DELETE FROM salary_changes WHERE id = $1',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.SALARY_CHANGES,
        { deleted: oldRecord.new_salary },
        { deleted: true },
        { true: `Удалено` },
      );
    }

    return deleted;
  }
}
