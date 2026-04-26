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
  createOrganizationSchema,
  updateOrganizationSchema,
} from './organizations.schema';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  async getAll() {
    return this.organizationsService.getAll();
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createOrganizationSchema))
    createDto: CreateOrganizationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationsService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateOrganizationSchema))
    updateDto: UpdateOrganizationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.delete(id, userId);
  }
}
