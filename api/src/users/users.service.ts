import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';

import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-position.dto';
import { UpdateUserDto } from './dto/update-position.dto';
import { UserWithDetails, UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<UserWithDetails[]> {
    const res: QueryResult<UserWithDetails> = await this.pool.query(`
      SELECT 
        u.*, 
        r.name as role_name,
        TRIM(CONCAT(e.last_name, ' ', e.first_name, ' ', e.middle_name)) as employee_fio
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.deleted_at IS NULL 
      ORDER BY u.created_at DESC
    `);
    return res.rows;
  }

  async getById(id: string): Promise<UserEntity | null> {
    const res: QueryResult<UserEntity> = await this.pool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0];
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    const { role_id, employee_id, login, password } = data;
    const hash = await argon2.hash(password);
    const res: QueryResult<UserEntity> = await this.pool.query(
      `INSERT INTO users (role_id, employee_id, login, password_hash)
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [role_id, employee_id, login, hash],
    );
    const newUser = res.rows[0];

    await this.auditLogService.logChanges(
      newUser.id,
      EntityType.USERS,
      {},
      newUser as unknown as Record<string, unknown>,
    );

    return newUser;
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity> {
    const oldUser = await this.getById(id);
    if (!oldUser) {
      throw new NotFoundException('');
    }

    const updateData: Record<string, unknown> = { ...data };

    if (
      typeof updateData.password === 'string' &&
      updateData.password.trim() !== ''
    ) {
      updateData.password_hash = await argon2.hash(updateData.password);
    }
    delete updateData.password;

    const allowedKeys = ['role_id', 'employee_id', 'login', 'password_hash'];
    const keys = Object.keys(updateData).filter(
      (key) => allowedKeys.includes(key) && updateData[key] !== undefined,
    );

    if (keys.length === 0) return oldUser;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => updateData[key]);

    const res = await this.pool.query<UserEntity>(
      `UPDATE users 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
       RETURNING *`,
      [...values, id],
    );

    const updatedUser = res.rows[0];
    if (!updatedUser) {
      throw new NotFoundException('');
    }

    await this.auditLogService.logChanges(
      id,
      EntityType.USERS,
      oldUser as unknown as Record<string, unknown>,
      updatedUser as unknown as Record<string, unknown>,
    );

    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const oldUser = await this.getById(id);
    if (!oldUser) {
      throw new NotFoundException('');
    }

    const res = await this.pool.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.USERS,
        { deleted: oldUser.login },
        { deleted: true },
        { true: `Удалено` },
      );
    }

    return deleted;
  }
}
