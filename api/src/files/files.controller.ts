import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  Redirect,
  UploadedFile,
} from '@nestjs/common';

import { FileEntity } from './entities/file.entity';
import { FilesService } from './files.service';
import { CustomFilesValidationPipe } from 'src/shared/pipes/custom-files-validation.pipe';
import { JoiValidationPipe } from 'src/shared/pipes/joi-validation.pipe';
import { createFileSchema } from './files.schema';
import { CreateFileDto } from './dto/create-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(readonly service: FilesService) {}

  @Get()
  async getAll(): Promise<FileEntity[]> {
    return this.service.getAll();
  }

  @Get('employee/:employeeId')
  async getByEmployee(
    @Param('employeeId') employeeId: string,
  ): Promise<FileEntity[]> {
    return this.service.getByEmployee(employeeId);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<FileEntity | null> {
    return this.service.getById(id);
  }

  @Get(':id/download')
  @Redirect()
  async download(
    @Param('id') id: string,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.service.getDownloadUrl(id);
    return { url, statusCode: 302 };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body(new JoiValidationPipe(createFileSchema)) body: CreateFileDto,
    @UploadedFile(new CustomFilesValidationPipe())
    file: Express.Multer.File,
  ): Promise<FileEntity> {
    return this.service.upload(body.employee_id, body.category_id, file);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.deleteFile(id);
  }
}
