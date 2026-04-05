import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
