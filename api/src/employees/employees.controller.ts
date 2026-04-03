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
import { createEmployeeSchema, updateEmployeeSchema } from './employees.schema';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getAll() {
    return this.employeesService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.employeesService.getById(id);
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createEmployeeSchema))
  async create(@Body() createDto: CreateEmployeeDto) {
    return this.employeesService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateEmployeeSchema))
    updateDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.employeesService.delete(id);
  }
}
