import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';

@Module({
  imports: [DbModule, OrganizationsModule, DepartmentsModule, PositionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
