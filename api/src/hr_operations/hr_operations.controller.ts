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
import {
  createHrOperationSchema,
  updateHrOperationSchema,
} from './hr_operations.schema';
import { HrOperationsService } from './hr_operations.service';
import { CreateHrOperationDto } from './dto/create-hr_operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr_operation.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('/hr-operations')
export class HrOperationsController {
  constructor(private readonly hrOperationsService: HrOperationsService) {}

  @Get()
  async getAll() {
    return this.hrOperationsService.getAll();
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createHrOperationSchema))
  async create(@Body() createDto: CreateHrOperationDto) {
    return this.hrOperationsService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateHrOperationSchema))
    updateDto: UpdateHrOperationDto,
  ) {
    return this.hrOperationsService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.hrOperationsService.delete(id);
  }
}
