import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { createDepartmentSchema, updateDepartmentSchema } from './departments.shema';

@Controller('/departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) { }

  @Get('org/:orgId')
  async getByOrg(@Param('orgId') orgId: string) {
    return this.departmentsService.getByOrg(orgId);
  }

  @Post()
  async create(
    @Body('organization_id') organization_id: string,
    @Body('name') name: string,
    @Body('comment') comment?: string,
    @Body('parent_id') parent_id?: string,
  ) {
    const { error } = createDepartmentSchema.validate({ name, comment });
    if (error) throw new Error(`Validation error: ${error.message}`);
    return this.departmentsService.create(
      organization_id,
      name,
      comment,
      parent_id,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('comment') comment?: string,
    @Body('parent_id') parent_id?: string,
  ) {
    const { error } = updateDepartmentSchema.validate({ name, comment });
    if (error) throw new Error(`Validation error: ${error.message}`);
    return this.departmentsService.update(id, name, comment, parent_id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.departmentsService.delete(id);
  }
}
