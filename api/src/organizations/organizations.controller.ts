import { Controller, Get, Delete, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('/organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  async getAll() {
    return this.organizationsService.getAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.organizationsService.delete(id);
  }
}
