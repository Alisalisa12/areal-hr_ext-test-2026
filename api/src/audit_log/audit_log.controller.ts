import { Controller, Get } from '@nestjs/common';
import { AuditLogService } from './audit_log.service';

@Controller('/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAll() {
    return this.auditLogService.getAll();
  }
}
