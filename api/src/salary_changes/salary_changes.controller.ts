import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CreateSalaryChangeDto } from './dto/create-salary_change.dto';
import { UpdateSalaryChangeDto } from './dto/update-salary_change.dto';
import {
  createSalaryChangeSchema,
  updateSalaryChangeSchema,
} from './salary_changes.schema';
import { SalaryChangesService } from './salary_changes.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('salary-changes')
export class SalaryChangesController {
  constructor(private readonly salaryChangesService: SalaryChangesService) {}

  @Get()
  async getAll() {
    return this.salaryChangesService.getAll();
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createSalaryChangeSchema))
    createDto: CreateSalaryChangeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salaryChangesService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateSalaryChangeSchema))
    updateDto: UpdateSalaryChangeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salaryChangesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.salaryChangesService.delete(id, userId);
  }
}
