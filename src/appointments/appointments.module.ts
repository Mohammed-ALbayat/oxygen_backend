import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Specialty])],
  controllers: [AdminAppointmentsController],
  providers: [AdminAppointmentsService],
})
export class AppointmentsModule {}
