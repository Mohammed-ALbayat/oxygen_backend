import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { AppointmentReview } from './entities/appointment-review.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PatientAppointmentsController } from './patient-appointments.controller';
import { PatientAppointmentsService } from './patient-appointments.service';
import { DoctorAppointmentsController } from './doctor-appointments.controller';
import { DoctorAppointmentsService } from './doctor-appointments.service';
import { DoctorReviewsController } from './doctor-reviews.controller';
import { PusherModule } from 'src/pusher/pusher.module';
import { AppointmentWaitingTimeService } from './appointment-waiting-time.service';
import { CancellationReasonsModule } from 'src/cancellation-reasons/cancellation-reasons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentReview,
      Specialty,
      DoctorSchedule,
      Doctor,
      Patient,
    ]),
    PusherModule,
    CancellationReasonsModule,
  ],
  controllers: [
    AdminAppointmentsController,
    AppointmentsController,
    PatientAppointmentsController,
    DoctorAppointmentsController,
    DoctorReviewsController,
  ],
  providers: [
    AdminAppointmentsService,
    AppointmentsService,
    PatientAppointmentsService,
    DoctorAppointmentsService,
    AppointmentWaitingTimeService,
  ],
  exports: [AdminAppointmentsService, AppointmentWaitingTimeService],
})
export class AppointmentsModule {}
export { AdminAppointmentsService };
