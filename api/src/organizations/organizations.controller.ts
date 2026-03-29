import { Controller, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('/organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  async getAll() {
    return this.organizationsService.getAll();
  }
}
