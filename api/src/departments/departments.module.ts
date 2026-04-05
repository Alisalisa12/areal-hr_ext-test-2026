import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
