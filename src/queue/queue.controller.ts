import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { AdminAppointmentsService } from 'src/appointments/admin-appointments.service';
import { AppointmentStatus } from 'src/appointments/entities/appointment.entity';
import { ApiHeader, ApiHeaders } from '@nestjs/swagger';

@Controller('queue')
export class QueueController {
  constructor(private readonly appointmentService: AdminAppointmentsService) {}

  @Get('active')
  @ApiHeader({
    name: 'x-api-key',
    required: true,
  })
  @UseGuards(ApiKeyGuard)
  async getActiveQueue() {
    const activeAppointments = await this.appointmentService.findAll(
      AppointmentStatus.WAITING,
    );

    return {
      success: true,
      data: activeAppointments,
    };
  }
}
