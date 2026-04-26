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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async getAll() {
    return this.positionsService.getAll();
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createPositionSchema))
    createDto: CreatePositionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.positionsService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updatePositionSchema))
    updateDto: UpdatePositionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.positionsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.positionsService.delete(id, userId);
  }
}
