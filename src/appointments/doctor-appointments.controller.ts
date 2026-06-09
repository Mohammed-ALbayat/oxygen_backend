import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  Body,
  Patch,
  Post,
} from '@nestjs/common';
import { DoctorAppointmentsService } from './doctor-appointments.service';
import { ApiBearerAuth } from 'node_modules/@nestjs/swagger/dist/decorators/api-bearer.decorator';

@ApiBearerAuth()
@Controller('doctor/appointments')
export class DoctorAppointmentsController {
  constructor(
    private readonly doctorAppointmentsService: DoctorAppointmentsService,
  ) {}

  @Get(':doctorId')
  getDoctorAppointments(@Param('doctorId') doctorId: number) {
    return this.doctorAppointmentsService.getDoctorAppointments(+doctorId);
  }
}
