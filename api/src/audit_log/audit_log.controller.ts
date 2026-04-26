import { Controller, Get } from '@nestjs/common';
import { AuditLogService } from './audit_log.service';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Roles('admin')
  @Get()
  async getAll() {
    return this.auditLogService.getAll();
  }
}
