import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Redirect,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';

interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getAll(): Promise<FileEntity[]> {
    return this.filesService.getAll();
  }

  @Get('employee/:employeeId')
  async getByEmployee(
    @Param('employeeId') employeeId: string,
  ): Promise<FileEntity[]> {
    return this.filesService.getByEmployee(employeeId);
  }

  @Get(':id/download')
  @Redirect()
  async download(
    @Param('id') id: string,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.filesService.getDownloadUrl(id);
    return { url, statusCode: 302 };
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<FileEntity | null> {
    return this.filesService.getById(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: MulterFile | undefined,
    @Body('employee_id') employeeId: string,
    @Body('category_id') categoryId: string,
  ): Promise<FileEntity> {
    if (!file) throw new BadRequestException('Файл не выбран');
    if (!employeeId || !categoryId)
      throw new BadRequestException('ID сотрудника и категории обязательны');

    return this.filesService.upload(
      employeeId,
      categoryId,
      file.originalname,
      file.mimetype,
      file.buffer,
      file.size,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return this.filesService.delete(id);
  }
}
