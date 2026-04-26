import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CreateFileCategoryDto } from './dto/create-file_category.dto';
import { UpdateFileCategoryDto } from './dto/update-file_category.dto';
import { FileCategoriesService } from './file_categories.service';
import {
  createFileCategorySchema,
  updateFileCategorySchema,
} from './file_categories.schema';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('file-categories')
export class FileCategoriesController {
  constructor(private readonly fileCategoriesService: FileCategoriesService) {}

  @Get()
  async getAll() {
    return this.fileCategoriesService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.fileCategoriesService.getById(id);
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createFileCategorySchema))
    createDto: CreateFileCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.fileCategoriesService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateFileCategorySchema))
    updateDto: UpdateFileCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.fileCategoriesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.fileCategoriesService.delete(id, userId);
  }
}
