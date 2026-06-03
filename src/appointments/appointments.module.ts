import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [AdminAppointmentsController],
  providers: [AdminAppointmentsService],
})
export class AppointmentsModule {}
