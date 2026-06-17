import { Controller, Get, Query } from '@nestjs/common';
import { DoctorAppointmentsService } from './doctor-appointments.service';
import { ApiBearerAuth } from 'node_modules/@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { AppointmentStatus } from './entities/appointment.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Appointments Doctor')
@Controller('doctor/appointments')
export class DoctorAppointmentsController {
  constructor(
    private readonly doctorAppointmentsService: DoctorAppointmentsService,
  ) {}

  @Get()
  getDoctorAppointments(
    @Query('doctorId') doctorId: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.doctorAppointmentsService.getDoctorAppointments(
      +doctorId,
      status,
    );
  }
}
