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

import { createUserSchema, updateUserSchema } from './users.schema';
import { UsersService } from './users.service';

import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CreateUserDto } from './dto/create-position.dto';
import { UpdateUserDto } from './dto/update-position.dto';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll() {
    return this.usersService.getAll();
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createUserSchema))
  async create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateUserSchema))
    updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
