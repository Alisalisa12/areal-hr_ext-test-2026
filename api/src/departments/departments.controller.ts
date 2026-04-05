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
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from './departments.shema';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Get()
  async getAll() {
    return this.departmentsService.findAll();
  }

  @Get('organization/:orgId')
  async getByOrg(@Param('orgId') orgId: string) {
    return this.departmentsService.getByOrg(orgId);
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createDepartmentSchema))
  async create(@Body() createDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateDepartmentSchema))
    updateDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.departmentsService.delete(id);
  }
}
