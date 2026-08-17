import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppModule } from 'src/app.module';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AppointmentReview } from 'src/appointments/entities/appointment-review.entity';
import { CancellationReason } from 'src/cancellation-reasons/entities/cancellation-reason.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { User } from 'src/users/entities/user.entity';
import { Visit } from 'src/visits/entities/visit.entity';
import { LargeSeederService } from './large-seeder.service';

@Module({
  imports: [
    AppModule,
    TypeOrmModule.forFeature([
      User,
      Specialty,
      CancellationReason,
      Doctor,
      DoctorSchedule,
      Secretary,
      Patient,
      Appointment,
      Visit,
      AppointmentReview,
    ]),
  ],
  providers: [LargeSeederService],
})
export class LargeSeedModule {}
