import { Module } from '@nestjs/common';
import { SalaryChangesService } from './salary_changes.service';
import { SalaryChangesController } from './salary_changes.controller';
import { DbModule } from '../db/db.module';
@Module({
  imports: [DbModule],
  controllers: [SalaryChangesController],
  providers: [SalaryChangesService],
})
export class SalaryChangesModule {}
