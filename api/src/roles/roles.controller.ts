import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { createRoleSchema, updateRoleSchema } from './roles.schema';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('roles')
@Roles('admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAll() {
    return this.rolesService.getAll();
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createRoleSchema))
    createDto: CreateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rolesService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateRoleSchema)) updateDto: UpdateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.rolesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.rolesService.delete(id, userId);
  }
}
