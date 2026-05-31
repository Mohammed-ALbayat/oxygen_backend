import { Module } from '@nestjs/common';
import { SecretariesService } from './secretaries.service';
import { SecretariesController } from './secretaries.controller';
import { User } from 'src/users/entities/user.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Secretary } from './entities/secretary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Specialty, User, Secretary])],
  providers: [SecretariesService],
  controllers: [SecretariesController],
})
export class SecretariesModule {}
