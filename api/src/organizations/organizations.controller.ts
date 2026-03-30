import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { createOrganizationSchema, updateOrganizationSchema } from './organizations.schema';
@Controller('/organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) { }

  @Get()
  async getAll() {
    return this.organizationsService.getAll();
  }

  @Post()
  async create(@Body('name') name: string, @Body('comment') comment?: string) {
    const { error } = createOrganizationSchema.validate({ name, comment });
    if (error) throw new Error(`Validation error: ${error.message}`);
    return this.organizationsService.create(name, comment);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('comment') comment?: string,
  ) {
    const { error } = updateOrganizationSchema.validate({ name, comment });
    if (error) throw new Error(`Validation error: ${error.message}`);
    return this.organizationsService.update(id, name, comment);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.organizationsService.delete(id);
  }
}
