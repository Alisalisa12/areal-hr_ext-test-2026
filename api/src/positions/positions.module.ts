import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
