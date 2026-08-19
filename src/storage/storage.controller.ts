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

@Controller('storage')
export class StorageController {
  @Get()
  serveImageByQuery(
    @Query('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!filename) {
      throw new BadRequestException('filename query parameter is required');
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
        'Invalid filename or potentially dangerous path detected',
      );
    }
  }
}
