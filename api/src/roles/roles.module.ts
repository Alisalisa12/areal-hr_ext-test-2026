import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuditLogModule } from 'src/audit_log/audit_log.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
