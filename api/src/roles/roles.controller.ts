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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { createRoleSchema, updateRoleSchema } from './roles.schema';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAll() {
    return this.rolesService.getAll();
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createRoleSchema))
  async create(@Body() createDto: CreateRoleDto) {
    return this.rolesService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateRoleSchema)) updateDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
