import { Module } from '@nestjs/common';
import { SecretariesService } from './secretaries.service';
import { SecretariesController } from './secretaries.controller';

@Module({
  providers: [SecretariesService],
  controllers: [SecretariesController]
})
export class SecretariesModule {}
