import { Module } from '@nestjs/common';
import { SalaryChangesService } from './salary_changes.service';
import { SalaryChangesController } from './salary_changes.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [SalaryChangesController],
  providers: [SalaryChangesService],
})
export class SalaryChangesModule {}
