import {
  Controller,
  Get,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UPLOADS_DIR } from './config/upload-path';

@Controller('storage')
export class StorageController {
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
