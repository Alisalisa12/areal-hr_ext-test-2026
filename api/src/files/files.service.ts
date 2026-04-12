import {
  Injectable,
  Inject,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool, QueryResult } from 'pg';
import { FileEntity } from './entities/file.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = 'hr-files';

@Injectable()
export class FilesService implements OnModuleInit {
  private minio: Minio.Client;

  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {
    this.minio = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT ?? 'hr_minio',
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      const exists = await this.minio.bucketExists(BUCKET);
      if (!exists) await this.minio.makeBucket(BUCKET);
    } catch (err) {
      console.error('MinIO connection error:', err);
    }
  }

  async getAll(): Promise<FileEntity[]> {
    const res: QueryResult<FileEntity> = await this.pool.query(
      `SELECT * FROM files WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    );
    return res.rows;
  }

  async getByEmployee(employeeId: string): Promise<FileEntity[]> {
    const res: QueryResult<FileEntity> = await this.pool.query(
      `SELECT * FROM files WHERE employee_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
      [employeeId],
    );
    return res.rows;
  }

  async getById(id: string): Promise<FileEntity | null> {
    const res: QueryResult<FileEntity> = await this.pool.query(
      'SELECT * FROM files WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async upload(
    employeeId: string,
    categoryId: string,
    originalName: string,
    mimeType: string,
    buffer: Buffer,
    size: number,
  ): Promise<FileEntity> {
    const ext = originalName.split('.').pop() ?? '';
    const storagePath = `${employeeId}/${uuidv4()}.${ext}`;

    await this.minio.putObject(BUCKET, storagePath, buffer, size, {
      'Content-Type': mimeType,
    });

    const res: QueryResult<FileEntity> = await this.pool.query(
      `INSERT INTO files (employee_id, category_id, name, storage_path, mime_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employeeId, categoryId, originalName, storagePath, mimeType],
    );

    const newFile = res.rows[0];

    await this.auditLogService.logChanges(
      newFile.id,
      EntityType.FILES,
      {},
      newFile as unknown as Record<string, unknown>,
    );

    return newFile;
  }

  async getDownloadUrl(id: string): Promise<string> {
    const file = await this.getById(id);
    if (!file) throw new NotFoundException();

    return await this.minio.presignedGetObject(BUCKET, file.storage_path, 3600);
  }

  async delete(id: string): Promise<boolean> {
    const oldFile = await this.getById(id);
    if (!oldFile) {
      throw new NotFoundException();
    }

    const res = await this.pool.query(
      `UPDATE files SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    const deleted = (res.rowCount ?? 0) > 0;

    if (deleted) {
      await this.auditLogService.logChanges(
        id,
        EntityType.FILES,
        { deleted: oldFile.name },
        { deleted: true },
        { true: `Удалено` },
      );
    }

    return deleted;
  }
}
