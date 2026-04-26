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
  createHrOperationSchema,
  updateHrOperationSchema,
} from './hr_operations.schema';
import { HrOperationsService } from './hr_operations.service';
import { CreateHrOperationDto } from './dto/create-hr_operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr_operation.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('hr-operations')
export class HrOperationsController {
  constructor(private readonly hrOperationsService: HrOperationsService) {}

  @Get()
  async getAll() {
    return this.hrOperationsService.getAll();
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createHrOperationSchema))
    createDto: CreateHrOperationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.hrOperationsService.create({
      ...createDto,
      created_by: userId,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateHrOperationSchema))
    updateDto: UpdateHrOperationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.hrOperationsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.hrOperationsService.delete(id, userId);
  }
}
