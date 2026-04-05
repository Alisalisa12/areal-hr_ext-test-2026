import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
} from '@nestjs/common';
import { createAuditLogSchema, updateAuditLogSchema } from './audit_log.schema';
import { AuditLogService } from './audit_log.service';
import { CreateAuditLogDto } from './dto/create-audit_log.dto';
import { UpdateAuditLogDto } from './dto/update-audit_log.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAll() {
    return this.auditLogService.getAll();
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createAuditLogSchema))
  async create(@Body() createDto: CreateAuditLogDto) {
    return this.auditLogService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateAuditLogSchema))
    updateDto: UpdateAuditLogDto,
  ) {
    return this.auditLogService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.auditLogService.delete(id);
  }
}
