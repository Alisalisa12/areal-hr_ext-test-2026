import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import { PG_CONNECTION } from '../constants';
import { AuditLogService } from '../audit_log/audit_log.service';
import { EntityType } from '../audit_log/entities/audit_log.entity';
import { FileEntity } from './entities/file.entity';
import { InjectMinio } from 'src/minio/minio.decorator';

@Injectable()
export class FilesService {
  private readonly bucketName = 'hr-files';

  constructor(
    @InjectMinio() private readonly minioClient: Minio.Client,
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly auditLogService: AuditLogService,
  ) {}

  async upload(
    employeeId: string,
    categoryId: string,
    file: Express.Multer.File,
  ): Promise<FileEntity> {
    const filename = `${randomUUID().toString()}-${file.originalname}`;
    const storagePath = `${employeeId}/${filename}`;

    await this.minioClient.putObject(
      this.bucketName,
      storagePath,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const res: QueryResult<FileEntity> = await this.pool.query(
      `INSERT INTO files (employee_id, category_id, name, storage_path, mime_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employeeId, categoryId, file.originalname, storagePath, file.mimetype],
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
    if (!file) {
      throw new NotFoundException('Файл не найден или удален');
    }

    const presigned = await this.minioClient.presignedGetObject(
      this.bucketName,
      file.storage_path,
      3600,
      {
        'response-content-disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      },
    );

    const internalBase = `http://${process.env.MINIO_ENDPOINT ?? 'minio'}:${process.env.MINIO_PORT ?? '9000'}`;
    const publicBase = process.env.MINIO_PUBLIC_URL ?? '/minio';

    return presigned.replace(internalBase, publicBase);
  }

  async getById(id: string): Promise<FileEntity | null> {
    const res: QueryResult<FileEntity> = await this.pool.query(
      'SELECT * FROM files WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows[0] || null;
  }

  async getByEmployee(employeeId: string): Promise<FileEntity[]> {
    const res: QueryResult<FileEntity> = await this.pool.query(
      'SELECT * FROM files WHERE employee_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
      [employeeId],
    );
    return res.rows;
  }

  async getAll(): Promise<FileEntity[]> {
    const res: QueryResult<FileEntity> = await this.pool.query(
      'SELECT * FROM files WHERE deleted_at IS NULL ORDER BY created_at DESC',
    );
    return res.rows;
  }

  async deleteFile(id: string): Promise<void> {
    const oldFile = await this.getById(id);
    if (!oldFile) {
      throw new NotFoundException();
    }

    const res = await this.pool.query(
      'UPDATE files SET deleted_at = NOW() WHERE id = $1 RETURNING name',
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
  }
}
