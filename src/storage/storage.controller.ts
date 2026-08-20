import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UPLOADS_DIR } from './config/upload-path';
import { I18nService } from 'nestjs-i18n';

@Controller('storage')
export class StorageController {
  constructor(private readonly i18n: I18nService) {}
  @Get()
  serveImageByQuery(
    @Query('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!filename) {
      throw new BadRequestException(
        this.i18n.t('storage.FILENAME_REQUIRED'),
      );
    }

    this.validateFilename(filename);

    return res.sendFile(filename, { root: UPLOADS_DIR });
  }

  @Get(':filename')
  serveImage(@Param('filename') filename: string, @Res() res: Response) {
    this.validateFilename(filename);

    return res.sendFile(filename, { root: UPLOADS_DIR });
  }

  private validateFilename(filename: string) {
    const isValid = /^[a-zA-Z0-9-]+\.(png|jpg|jpeg|webp)$/.test(filename);
    if (!isValid) {
      throw new BadRequestException(
        this.i18n.t('storage.INVALID_FILENAME'),
      );
    }
  }
}
