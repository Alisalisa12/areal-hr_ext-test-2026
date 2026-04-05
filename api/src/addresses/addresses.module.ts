import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
