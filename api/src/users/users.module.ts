import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DbModule } from '../db/db.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  imports: [DbModule, AuditLogModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
