import { Module } from '@nestjs/common';
import { FileCategoriesService } from './file_categories.service';
import { FileCategoriesController } from './file_categories.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [FileCategoriesController],
  providers: [FileCategoriesService],
})
export class FileCategoriesModule {}
