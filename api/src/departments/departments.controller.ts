import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from './departments.schema';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async getAll() {
    return this.departmentsService.findAll();
  }

  @Get('organization/:orgId')
  async getByOrg(@Param('orgId') orgId: string) {
    return this.departmentsService.getByOrg(orgId);
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createDepartmentSchema))
    createDto: CreateDepartmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.departmentsService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateDepartmentSchema))
    updateDto: UpdateDepartmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.departmentsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.departmentsService.delete(id, userId);
  }
}
