import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { FileCategoryEntity } from './entities/file_category.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreateFileCategoryDto } from './dto/create-file_category.dto';
import { UpdateFileCategoryDto } from './dto/update-file_category.dto';

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

  async create(
    data: CreateFileCategoryDto,
    userId: string,
  ): Promise<FileCategoryEntity> {
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
      newCategory as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return newCategory;
  }

  async update(
    id: string,
    data: UpdateFileCategoryDto,
    userId: string,
  ): Promise<FileCategoryEntity> {
    const oldCategory = await this.getById(id);
    if (!oldCategory) {
      throw new NotFoundException();
    }

    const allowedKeys = ['name', 'comment'];
    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdateFileCategoryDto] !== undefined,
    );

    if (keys.length === 0) return oldCategory;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdateFileCategoryDto]);

    const res = await this.pool.query<FileCategoryEntity>(
      `UPDATE file_categories 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
       RETURNING *`,
      [...values, id],
    );

    const updatedCategory = res.rows[0];
    if (!updatedCategory) {
      throw new NotFoundException();
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.FILE_CATEGORIES,
      oldCategory as unknown as Record<string, unknown>,
      updatedCategory as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return updatedCategory;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const oldCategory = await this.getById(id);
    if (!oldCategory) {
      throw new NotFoundException();
    }

    const res = await this.pool.query(
      'UPDATE file_categories SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.FILE_CATEGORIES,
        { deleted: oldCategory.name },
        { deleted: true },
        { true: 'Удалено' },
        userId,
      );
    }

    return deleted;
  }
}
