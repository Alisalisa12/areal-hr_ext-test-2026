import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('/organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) { }

  @Get()
  async getAll() {
    return this.organizationsService.getAll();
  }

  @Post()
  async create(@Body('name') name: string, @Body('comment') comment?: string) {
    return this.organizationsService.create(name, comment);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.organizationsService.delete(id);
  }
}
