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
import { createPositionSchema, updatePositionSchema } from './positions.schema';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('/positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async getAll() {
    return this.positionsService.getAll();
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createPositionSchema))
  async create(@Body() createDto: CreatePositionDto) {
    return this.positionsService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updatePositionSchema))
    updateDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.positionsService.delete(id);
  }
}
