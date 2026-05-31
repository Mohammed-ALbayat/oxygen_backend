import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Doctor, Patient, Secretary, Specialty]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
