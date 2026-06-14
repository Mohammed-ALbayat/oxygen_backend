import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PatientAppointmentsController } from './patient-appointments.controller';
import { PatientAppointmentsService } from './patient-appointments.service';
import { DoctorAppointmentsController } from './doctor-appointments.controller';
import { DoctorAppointmentsService } from './doctor-appointments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Specialty, DoctorSchedule, Doctor]),
  ],
  controllers: [
    AdminAppointmentsController,
    AppointmentsController,
    PatientAppointmentsController,
    DoctorAppointmentsController,
  ],
  providers: [
    AdminAppointmentsService,
    AppointmentsService,
    PatientAppointmentsService,
    DoctorAppointmentsService,
    AppointmentsService,
  ],
})
export class AppointmentsModule {}
