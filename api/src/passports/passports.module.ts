import { Module } from '@nestjs/common';
import { PassportsService } from './passports.service';
import { PassportsController } from './passports.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [PassportsController],
  providers: [PassportsService],
})
export class PassportsModule {}
