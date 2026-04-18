import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { EmployeesModule } from './employees/employees.module';
import { PassportsModule } from './passports/passports.module';
import { AddressesModule } from './addresses/addresses.module';
import { HrOperationsModule } from './hr_operations/hr_operations.module';
import { SalaryChangesModule } from './salary_changes/salary_changes.module';
import { AuditLogModule } from './audit_log/audit_log.module';
import { FileCategoriesModule } from './file_categories/file_categories.module';
import { FilesModule } from './files/files.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    DbModule,
    OrganizationsModule,
    DepartmentsModule,
    PositionsModule,
    EmployeesModule,
    PassportsModule,
    AddressesModule,
    HrOperationsModule,
    SalaryChangesModule,
    AuditLogModule,
    FileCategoriesModule,
    FilesModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
