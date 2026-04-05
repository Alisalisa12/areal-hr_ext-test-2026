import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { OrganizationEntity } from './entities/organization.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<OrganizationEntity[]> {
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'SELECT * FROM organizations WHERE deleted_at IS NULL ORDER BY name ASC',
    );
    return res.rows;
  }

  async create(data: Partial<OrganizationEntity>): Promise<OrganizationEntity> {
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
      {
        name: newOrg.name,
        comment: newOrg.comment,
      } as unknown as Record<string, unknown>,
    );

    return newOrg;
  }

  async update(
    id: string,
    data: Partial<OrganizationEntity>,
  ): Promise<OrganizationEntity | null> {
    const oldOrg = await this.getById(id);
    if (!oldOrg) return null;

    const { name, comment } = data;
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'UPDATE organizations SET name = COALESCE($1, name), comment = COALESCE($2, comment), updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [name ?? null, comment ?? null, id],
    );

    const updatedOrg = res.rows[0] || null;

    if (updatedOrg) {
      await this.auditLogService.logChanges(
        id,
        EntityType.ORGANIZATIONS,
        oldOrg as unknown as Record<string, unknown>,
        updatedOrg as unknown as Record<string, unknown>,
      );
    }

    return updatedOrg;
  }

  async delete(id: string): Promise<boolean> {
    const oldOrg = await this.getById(id);
    const res = await this.pool.query(
      'UPDATE organizations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted && oldOrg) {
      await this.auditLogService.create({
        entity_id: id,
        entity_type: EntityType.ORGANIZATIONS,
        field_name: 'deleted',
        old_value: oldOrg.name,
        new_value: 'удалено',
      });
    }

    return deleted;
  }

  async getById(id: string): Promise<OrganizationEntity | null> {
    const res: QueryResult<OrganizationEntity> = await this.pool.query(
      'SELECT * FROM organizations WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }
}
