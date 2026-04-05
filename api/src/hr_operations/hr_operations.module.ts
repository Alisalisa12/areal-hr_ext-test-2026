import { Module } from '@nestjs/common';
import { HrOperationsService } from './hr_operations.service';
import { HrOperationsController } from './hr_operations.controller';
import { DbModule } from '../db/db.module';
@Module({
  imports: [DbModule],
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
})
export class HrOperationsModule {}
