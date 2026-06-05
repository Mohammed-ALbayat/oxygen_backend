import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AdminPatientsController } from './admin-patients.controller';
import { AdminPatientsService } from './admin-patients.service';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, User])],

  controllers: [AdminPatientsController, PatientsController],
  providers: [AdminPatientsService,PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
