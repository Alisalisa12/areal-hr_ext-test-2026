import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { AddressEntity } from './entities/address.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';

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
    return res.rows[0] ?? null;
  }

  async create(data: Partial<AddressEntity>): Promise<AddressEntity> {
    const { employee_id, region, city, street, house, block, flat } = data;
    const res: QueryResult<AddressEntity> = await this.pool.query(
      `INSERT INTO addresses (employee_id, region, city, street, house, block, flat)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [employee_id, region, city, street, house, block, flat],
    );

    const newAddress = res.rows[0];

    await this.auditLogService.logChanges(
      newAddress.id,
      EntityType.ADDRESSES,
      {},
      {
        employee_id: newAddress.employee_id,
        region: newAddress.region,
        city: newAddress.city,
        street: newAddress.street,
        house: newAddress.house,
        block: newAddress.block,
        flat: newAddress.flat,
      } as unknown as Record<string, unknown>,
    );

    return newAddress;
  }

  async update(
    id: string,
    data: Partial<AddressEntity>,
  ): Promise<AddressEntity | null> {
    const oldAddress = await this.getById(id);
    if (!oldAddress) return null;

    const { region, city, street, house, block, flat } = data;
    const res: QueryResult<AddressEntity> = await this.pool.query(
      `UPDATE addresses
       SET region = COALESCE($1, region),
           city = COALESCE($2, city),
           street = COALESCE($3, street),
           house = COALESCE($4, house),
           block = COALESCE($5, block),
           flat = COALESCE($6, flat),
           updated_at = NOW()
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [region, city, street, house, block, flat, id],
    );

    const updatedAddress = res.rows[0] ?? null;

    if (updatedAddress) {
      await this.auditLogService.logChanges(
        id,
        EntityType.ADDRESSES,
        oldAddress as unknown as Record<string, unknown>,
        updatedAddress as unknown as Record<string, unknown>,
      );
    }

    return updatedAddress;
  }

  async delete(id: string): Promise<boolean> {
    const oldAddress = await this.getById(id);

    const res = await this.pool.query(
      'UPDATE addresses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted && oldAddress) {
      await this.auditLogService.create({
        entity_id: id,
        entity_type: EntityType.ADDRESSES,
        field_name: 'deleted',
        old_value: `${oldAddress.city}, ${oldAddress.street} ${oldAddress.house}`,
        new_value: 'удалено',
      });
    }

    return deleted;
  }
}
