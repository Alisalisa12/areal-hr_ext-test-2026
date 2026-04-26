import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { AddressEntity } from './entities/address.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAll(): Promise<AddressEntity[]> {
    const res: QueryResult<AddressEntity> = await this.pool.query(
      'SELECT * FROM addresses WHERE deleted_at IS NULL ORDER BY created_at ASC',
    );
    return res.rows;
  }

  async getByEmployee(employeeId: string): Promise<AddressEntity[]> {
    const res: QueryResult<AddressEntity> = await this.pool.query(
      'SELECT * FROM addresses WHERE employee_id = $1 AND deleted_at IS NULL',
      [employeeId],
    );
    return res.rows;
  }

  async getById(id: string): Promise<AddressEntity | null> {
    const res: QueryResult<AddressEntity> = await this.pool.query(
      'SELECT * FROM addresses WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async create(data: CreateAddressDto, userId: string): Promise<AddressEntity> {
    const { employee_id, region, city, street, house, block, flat } = data;
    const res: QueryResult<AddressEntity> = await this.pool.query(
      `INSERT INTO addresses (employee_id, region, city, street, house, block, flat) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [employee_id, region, city, street, house, block ?? null, flat ?? null],
    );
    const newAddress = res.rows[0];

    await this.auditLogService.logChanges(
      newAddress.id,
      EntityType.ADDRESSES,
      {},
      newAddress as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return newAddress;
  }

  async update(
    id: string,
    data: UpdateAddressDto,
    userId: string,
  ): Promise<AddressEntity> {
    const oldAddress = await this.getById(id);
    if (!oldAddress) throw new NotFoundException();

    const allowedKeys = ['region', 'city', 'street', 'house', 'block', 'flat'];
    const keys = Object.keys(data).filter(
      (key) =>
        allowedKeys.includes(key) &&
        data[key as keyof UpdateAddressDto] !== undefined,
    );

    if (keys.length === 0) return oldAddress;

    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const values = keys.map((key) => data[key as keyof UpdateAddressDto]);

    const res = await this.pool.query<AddressEntity>(
      `UPDATE addresses 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $${keys.length + 1} AND deleted_at IS NULL 
       RETURNING *`,
      [...values, id],
    );

    const updatedAddress = res.rows[0];
    if (!updatedAddress) throw new NotFoundException();

    await this.auditLogService.logChanges(
      id,
      EntityType.ADDRESSES,
      oldAddress as unknown as Record<string, unknown>,
      updatedAddress as unknown as Record<string, unknown>,
      {},
      userId,
    );

    return updatedAddress;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const oldAddress = await this.getById(id);
    if (!oldAddress) throw new NotFoundException();

    const res = await this.pool.query(
      'UPDATE addresses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.ADDRESSES,
        {
          deleted: `${oldAddress.city}, ${oldAddress.street} ${oldAddress.house}`,
        },
        { deleted: true },
        { true: 'Удалено' },
        userId,
      );
    }

    return deleted;
  }
}
