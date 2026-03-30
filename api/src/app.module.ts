import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DepartmentsModule } from './departments/departments.module';
@Module({
  imports: [DbModule, OrganizationsModule, DepartmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
