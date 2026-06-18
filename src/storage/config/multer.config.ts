import type { Request } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerUploadConfig = {
  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (_req: Request, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Unsupported file type! Only JPG, PNG, and WEBP are allowed.',
        ),
        false,
      );
    }
  },

  storage: diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: any) => {
      cb(null, './storage/uploads');
    },
    filename: (_req: Request, file: Express.Multer.File, cb: any) => {
      const uniqueFilename = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  }),
};
