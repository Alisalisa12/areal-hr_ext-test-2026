import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('/positions')
export class PositionsController {
  constructor(private positionsService: PositionsService) {}

  @Get()
  async getAll() {
    return this.positionsService.getAll();
  }

  @Post()
  async create(@Body('name') name: string, @Body('comment') comment?: string) {
    return this.positionsService.create(name, comment);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('comment') comment?: string,
  ) {
    return this.positionsService.update(id, name, comment);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.positionsService.delete(id);
  }
}
