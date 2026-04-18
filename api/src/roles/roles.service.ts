import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { RoleEntity } from './entities/role.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<RoleEntity[]> {
    const res: QueryResult<RoleEntity> = await this.pool.query(
      'SELECT * FROM roles WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    return res.rows;
  }

  async getById(id: string): Promise<RoleEntity | null> {
    const res: QueryResult<RoleEntity> = await this.pool.query(
      'SELECT * FROM roles WHERE role_id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(data: CreateRoleDto): Promise<RoleEntity> {
    const { name } = data;
    const res: QueryResult<RoleEntity> = await this.pool.query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING *',
      [name],
    );
    const newRole = res.rows[0];

    await this.auditLogService.logChanges(
      newRole.id,
      EntityType.ROLES,
      {},
      newRole as unknown as Record<string, unknown>,
    );

    return newRole;
  }

  async update(id: string, data: UpdateRoleDto): Promise<RoleEntity> {
    const oldRole = await this.getById(id);
    if (!oldRole) throw new NotFoundException();

    const keys = Object.keys(data).filter(
      (key) => data[key as keyof UpdateRoleDto] !== undefined,
    );
    if (keys.length === 0) return oldRole;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdateRoleDto]);

    const res = await this.pool.query<RoleEntity>(
      `UPDATE roles SET ${setClause}, updated_at = NOW() 
       WHERE role_id = $${keys.length + 1} AND deleted_at IS NULL RETURNING *`,
      [...values, id],
    );

    const updatedRole = res.rows[0];
    await this.auditLogService.logChanges(
      id,
      EntityType.ROLES,
      oldRole as unknown as Record<string, unknown>,
      updatedRole as unknown as Record<string, unknown>,
    );

    return updatedRole;
  }

  async delete(id: string): Promise<boolean> {
    const oldRole = await this.getById(id);
    if (!oldRole) throw new NotFoundException('');

    const res = await this.pool.query(
      'UPDATE roles SET deleted_at = NOW() WHERE role_id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;
    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.ROLES,
        { name: oldRole.name },
        { deleted: true },
        { true: `Удалено` },
      );
    }
    return deleted;
  }
}
