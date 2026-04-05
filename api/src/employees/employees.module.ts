import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
