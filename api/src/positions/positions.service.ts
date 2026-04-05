import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { PositionEntity } from './entities/position.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

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

  async create(data: Partial<PositionEntity>): Promise<PositionEntity> {
    const { name, comment } = data;
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'INSERT INTO positions (name, comment) VALUES ($1, $2) RETURNING *',
      [name, comment ?? null],
    );
    const newPos = res.rows[0];

    await this.auditLogService.logChanges(newPos.id, EntityType.POSITIONS, {}, {
      name: newPos.name,
      comment: newPos.comment,
    } as unknown as Record<string, unknown>);

    return newPos;
  }

  async update(
    id: string,
    data: Partial<PositionEntity>,
  ): Promise<PositionEntity | null> {
    const oldPos = await this.getById(id);
    if (!oldPos) return null;

    const { name, comment } = data;
    const res: QueryResult<PositionEntity> = await this.pool.query(
      'UPDATE positions SET name = COALESCE($1, name), comment = COALESCE($2, comment), updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [name ?? null, comment ?? null, id],
    );

    const updatedPos = res.rows[0] || null;

    if (updatedPos) {
      await this.auditLogService.logChanges(
        id,
        EntityType.POSITIONS,
        oldPos as unknown as Record<string, unknown>,
        updatedPos as unknown as Record<string, unknown>,
      );
    }

    return updatedPos;
  }

  async delete(id: string): Promise<boolean> {
    const oldPos = await this.getById(id);
    const res = await this.pool.query(
      'UPDATE positions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted && oldPos) {
      await this.auditLogService.create({
        entity_id: id,
        entity_type: EntityType.POSITIONS,
        field_name: 'deleted',
        old_value: oldPos.name,
        new_value: 'удалено',
      });
    }

    return deleted;
  }
}
