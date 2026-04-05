import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { CreateSalaryChangeDto } from './dto/create-salary_change.dto';
import { UpdateSalaryChangeDto } from './dto/update-salary_change.dto';
import {
  createSalaryChangeSchema,
  updateSalaryChangeSchema,
} from './salary_changes.schema';
import { SalaryChangesService } from './salary_changes.service';

@Controller('/salary-changes')
export class SalaryChangesController {
  constructor(private readonly salaryChangesService: SalaryChangesService) {}

  @Get()
  async getAll() {
    return this.salaryChangesService.getAll();
  }

  @Post()
  @UsePipes(new JoiValidationPipe(createSalaryChangeSchema))
  async create(@Body() createDto: CreateSalaryChangeDto) {
    return this.salaryChangesService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateSalaryChangeSchema))
    updateDto: UpdateSalaryChangeDto,
  ) {
    return this.salaryChangesService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.salaryChangesService.delete(id);
  }
}
