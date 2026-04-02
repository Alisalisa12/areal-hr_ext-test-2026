import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { DbModule } from '../db/db.module';
@Module({
  imports: [DbModule],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
