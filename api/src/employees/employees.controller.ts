import {
  Controller,
  Get,
  Query,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { createEmployeeSchema, updateEmployeeSchema } from './employees.schema';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getAll(
    @Query('viewMode') viewMode: 'active' | 'dismissed' | 'all' = 'active',
  ) {
    return this.employeesService.getAll(viewMode);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.employeesService.getById(id);
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createEmployeeSchema))
    createDto: CreateEmployeeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.employeesService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateEmployeeSchema))
    updateDto: UpdateEmployeeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.employeesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.employeesService.delete(id, userId);
  }
}
