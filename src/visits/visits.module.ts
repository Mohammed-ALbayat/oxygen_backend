import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { Visit } from './entities/visit.entity';
import { AdminVisitsController } from './admin-visits.controller';
import { DoctorVisitsController } from './doctor-visits.controller';
import { PatientVisitsController } from './patient-visits.controller';
import { AdminVisitsService } from './admin-visits.service';
import { DoctorVisitsService } from './doctor-visits.service';
import { PatientVisitsService } from './patient-visits.service';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visit, Appointment, Doctor])],
  controllers: [
    VisitsController,
    AdminVisitsController,
    DoctorVisitsController,
    PatientVisitsController,
  ],
  providers: [
    VisitsService,
    AdminVisitsService,
    DoctorVisitsService,
    PatientVisitsService,
  ],
})
export class VisitsModule {}
