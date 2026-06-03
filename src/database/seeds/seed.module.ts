import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from 'src/users/entities/user.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

import { AdminSeed } from './admin.seed';
import { DoctorsSeed } from './doctors.seed';
import { SpecialtiesSeed } from './specialties.seed';
import { PatientsSeed } from './patients.seed';
import { SecretariesSeed } from './secretaries.seed';
import { DemoDoctorSeed } from './demo-doctor.seed';
import { AppointmentsSeed } from './appointments.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Doctor,
      Specialty,
      Patient,
      Secretary,
      DoctorSchedule,
      Appointment,
    ]),
  ],
  controllers: [SeedController],
  providers: [
    AdminSeed,
    DoctorsSeed,
    SpecialtiesSeed,
    PatientsSeed,
    SecretariesSeed,
    DemoDoctorSeed,
    AppointmentsSeed,
    SeedService,
  ],
  exports: [
    AdminSeed,
    DoctorsSeed,
    SpecialtiesSeed,
    PatientsSeed,
    SecretariesSeed,
    DemoDoctorSeed,
    AppointmentsSeed,
    SeedService,
  ],
})
export class SeedModule {}
