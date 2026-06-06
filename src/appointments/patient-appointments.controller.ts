import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';
import { ApiBearerAuth } from 'node_modules/@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { PatientAppointmentsService } from './patient-appointments.service';
import { PatientUpdateAppointmentDto } from './dto/patient-update-appointment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiBearerAuth()
@Controller('patient/appointments')
@Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.PATIENT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientAppointmentsController {
  constructor(
    private readonly patientAppointmentsService: PatientAppointmentsService,
  ) {}

  @Patch('update/:patientId/:id')
  @Roles(UserRole.PATIENT)
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  patientUpdateAppointment(
    @Param('patientId') patientId: number,
    @Param('id') appointmentId: number,
    @Body() dto: PatientUpdateAppointmentDto,
  ) {
    return this.patientAppointmentsService.patientUpdateAppointment(
      +patientId,
      +appointmentId,
      dto,
    );
  }
}
