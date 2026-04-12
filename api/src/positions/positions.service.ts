import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { PositionEntity } from './entities/position.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<PositionEntity[]> {
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'SELECT * FROM positions WHERE deleted_at IS NULL ORDER BY name ASC',
    );
    return res.rows;
  }

  async getById(id: string): Promise<PositionEntity | null> {
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'SELECT * FROM positions WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(data: CreatePositionDto): Promise<PositionEntity> {
    const { name, comment } = data;
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'INSERT INTO positions (name, comment) VALUES ($1, $2) RETURNING *',
      [name, comment ?? null],
    );
    const newPos = res.rows[0];

    await this.auditLogService.logChanges(
      newPos.id,
      EntityType.POSITIONS,
      {},
      newPos as unknown as Record<string, unknown>,
    );

    return newPos;
  }

  async update(id: string, data: UpdatePositionDto): Promise<PositionEntity> {
    const oldPos = await this.getById(id);
    if (!oldPos) {
      throw new NotFoundException();
    }

    const allowedKeys = ['name', 'comment'];
    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdatePositionDto] !== undefined,
    );

    if (keys.length === 0) return oldPos;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdatePositionDto]);

    const res = await this.pool.query<PositionEntity>(
      `UPDATE positions 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
       RETURNING *`,
      [...values, id],
    );

    const updatedPos = res.rows[0];
    if (!updatedPos) {
      throw new NotFoundException();
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.POSITIONS,
      oldPos as unknown as Record<string, unknown>,
      updatedPos as unknown as Record<string, unknown>,
    );

    return updatedPos;
  }

  async delete(id: string): Promise<boolean> {
    const oldPos = await this.getById(id);
    if (!oldPos) {
      throw new NotFoundException();
    }

    const res = await this.pool.query(
      'UPDATE positions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.POSITIONS,
        { deleted: oldPos.name },
        { deleted: true },
        { true: `Удалено` },
      );
    }

    return deleted;
  }
}
