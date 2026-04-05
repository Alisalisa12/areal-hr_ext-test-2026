import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { FileCategoryEntity } from './entities/file_category.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

@Injectable()
export class FileCategoriesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<FileCategoryEntity[]> {
    const res: QueryResult<FileCategoryEntity> = await this.pool.query(
      'SELECT * FROM file_categories WHERE deleted_at IS NULL ORDER BY name ASC',
    );
    return res.rows;
  }

  async getById(id: string): Promise<FileCategoryEntity | null> {
    const res: QueryResult<FileCategoryEntity> = await this.pool.query(
      'SELECT * FROM file_categories WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(data: Partial<FileCategoryEntity>): Promise<FileCategoryEntity> {
    const { name, comment } = data;

    const res: QueryResult<FileCategoryEntity> = await this.pool.query(
      `INSERT INTO file_categories (name, comment) 
       VALUES ($1, $2) 
       RETURNING *`,
      [name, comment ?? null],
    );

    const newCategory = res.rows[0];

    await this.auditLogService.logChanges(
      newCategory.id,
      EntityType.FILE_CATEGORIES,
      {},
      {
        name: newCategory.name,
        comment: newCategory.comment,
      } as unknown as Record<string, unknown>,
    );

    return newCategory;
  }

  async update(
    id: string,
    data: Partial<FileCategoryEntity>,
  ): Promise<FileCategoryEntity | null> {
    const oldCategory = await this.getById(id);
    if (!oldCategory) return null;

    const { name, comment } = data;

    const res: QueryResult<FileCategoryEntity> = await this.pool.query(
      `UPDATE file_categories 
       SET 
        name = COALESCE($1, name),
        comment = COALESCE($2, comment),
        updated_at = NOW() 
       WHERE id = $3 AND deleted_at IS NULL 
       RETURNING *`,
      [name ?? null, comment ?? null, id],
    );

    const updatedCategory = res.rows[0] || null;

    if (updatedCategory) {
      await this.auditLogService.logChanges(
        id,
        EntityType.FILE_CATEGORIES,
        oldCategory as unknown as Record<string, unknown>,
        updatedCategory as unknown as Record<string, unknown>,
      );
    }

    return updatedCategory;
  }

  async delete(id: string): Promise<boolean> {
    const oldCategory = await this.getById(id);

    const res = await this.pool.query(
      'UPDATE file_categories SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted && oldCategory) {
      await this.auditLogService.create({
        entity_id: id,
        entity_type: EntityType.FILE_CATEGORIES,
        field_name: 'deleted',
        old_value: oldCategory.name,
        new_value: 'удалено',
      });
    }

    return deleted;
  }
}
