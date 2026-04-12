import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { OrganizationEntity } from './entities/organization.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<OrganizationEntity[]> {
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'SELECT * FROM organizations WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    return res.rows;
  }

  async getById(id: string): Promise<OrganizationEntity | null> {
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'SELECT * FROM organizations WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(data: CreateOrganizationDto): Promise<OrganizationEntity> {
    const { name, comment } = data;
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'INSERT INTO organizations (name, comment) VALUES ($1, $2) RETURNING *',
      [name, comment ?? null],
    );
    const newOrg = res.rows[0];

    await this.auditLogService.logChanges(
      newOrg.id,
      EntityType.ORGANIZATIONS,
      {},
      newOrg as unknown as Record<string, unknown>,
    );

    return newOrg;
  }

  async update(
    id: string,
    data: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const oldOrg = await this.getById(id);
    if (!oldOrg) {
      throw new NotFoundException();
    }

    const allowedKeys = ['name', 'comment'];
    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdateOrganizationDto] !== undefined,
    );

    if (keys.length === 0) return oldOrg;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdateOrganizationDto]);

    const res = await this.pool.query<OrganizationEntity>(
      `UPDATE organizations 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
       RETURNING *`,
      [...values, id],
    );

    const updatedOrg = res.rows[0];
    if (!updatedOrg) {
      throw new NotFoundException();
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.ORGANIZATIONS,
      oldOrg as unknown as Record<string, unknown>,
      updatedOrg as unknown as Record<string, unknown>,
    );

    return updatedOrg;
  }

  async delete(id: string): Promise<boolean> {
    const oldOrg = await this.getById(id);
    if (!oldOrg) {
      throw new NotFoundException();
    }

    const res = await this.pool.query(
      'UPDATE organizations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.ORGANIZATIONS,
        { deleted: oldOrg.name },
        { deleted: true },
        { true: `Удалено` },
      );
    }

    return deleted;
  }
}
