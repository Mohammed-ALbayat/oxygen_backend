import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '../database.module';
import { MainSeederService } from './main-seeder.service';
import { AppointmentsSeed } from './appointments.seed';
import { AdminSeed } from './admin.seed';
import { DemoDoctorSeed } from './demo-doctor.seed';
import { DoctorsSeed } from './doctors.seed';
import { PatientsSeed } from './patients.seed';
import { SecretariesSeed } from './secretaries.seed';
import { SpecialtiesSeed } from './specialties.seed';
import { User } from 'src/users/entities/user.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([
      User,
      Appointment,
      Doctor,
      Patient,
      Secretary,
      Specialty,
      DoctorSchedule,
    ]),
  ],
  providers: [
    MainSeederService,
    AdminSeed,
    AppointmentsSeed,
    DemoDoctorSeed,
    DoctorsSeed,
    PatientsSeed,
    SecretariesSeed,
    SpecialtiesSeed,
  ],
})
export class SeedModule {}
