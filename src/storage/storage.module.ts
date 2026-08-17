import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadController } from './upload.controller';
import { StorageController } from './storage.controller';
import { User } from '../users/entities/user.entity';
import { ensureUploadsDir } from './config/upload-path';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UploadController, StorageController],
})
export class StorageModule implements OnModuleInit {
  onModuleInit() {
    ensureUploadsDir();
  }
}
