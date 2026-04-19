import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export const MAX_FILE_SIZE = 10_000_000;

export enum MimeType {
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC = 'application/msword',
  TXT = 'text/plain',
  PDF = 'application/pdf',
  CSV = 'text/csv',
  JPG = 'image/jpeg',
  PNG = 'image/png',
}

@Injectable()
export class CustomFilesValidationPipe implements PipeTransform {
  protected allowedMimeTypes: string[] = [
    MimeType.DOC,
    MimeType.DOCX,
    MimeType.PNG,
    MimeType.PDF,
    MimeType.JPG,
  ];

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не выбран');
    }

    const mimeType = file.mimetype;

    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Тип файла ${mimeType} не поддерживается. Разрешены только: DOC, DOCX, PNG, PDF, JPG`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Файл ${file.originalname} слишком тяжелый. Максимум: ${MAX_FILE_SIZE} байт`,
      );
    }
    return file;
  }
}
