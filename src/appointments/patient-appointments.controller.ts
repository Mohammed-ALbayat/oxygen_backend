import {
  Controller,
  UseGuards,
  Param,
  ParseIntPipe,
  Body,
  Patch,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from 'node_modules/@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CancelAppointmentDto } from './dto/patient-cancellation.dto';
import { PatientUpdateAppointmentDto } from './dto/patient-update-appointment.dto';
import { PatientCreateAppointmentDto } from './dto/patient-create-appointment.dto';
import { PatientAppointmentsService } from './patient-appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentReviewDto } from './dto/create-appointment-review.dto';
import { AppointmentReviewDto } from './dto/appointment-review.dto';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiBearerAuth()
@ApiTags('Appointments Patients')
@Controller('patient/appointments')
@Roles(UserRole.PATIENT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientAppointmentsController {
  constructor(
    private readonly patientAppointmentsService: PatientAppointmentsService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @ApiQuery({
    name: 'appointment_status',
    required: false,
    enum: AppointmentStatus,
  })
  @Get('/')
  getAllAppointment(
    @CurrentUser() user: User,
    @Query('appointment_status') appointment_status?: AppointmentStatus,
  ) {
    return this.patientAppointmentsService.findAllAppointment(
      user.id,
      appointment_status,
    );
  }

  @Post('/')
  createAppointment(
    @CurrentUser() user: User,
    @Body() dto: PatientCreateAppointmentDto,
  ) {
    return this.patientAppointmentsService.createAppointment(user.id, dto);
  }

  @Patch('update/:id')
  patientUpdateAppointment(
    @CurrentUser() user: User,
    @Param('id') appointmentId: number,
    @Body() dto: PatientUpdateAppointmentDto,
  ) {
    return this.patientAppointmentsService.patientUpdateAppointment(
      user.id,
      +appointmentId,
      dto,
    );
  }

  @Patch('cancel/:id')
  cancelAppointment(
    @CurrentUser() user: User,
    @Param('id') appointmentId: number,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.patientAppointmentsService.patientCancelAppointment(
      user.id,
      +appointmentId,
      dto,
    );
  }

  @Post(':appointmentId/review')
  @ApiOkResponse({ type: AppointmentReviewDto })
  @ApiEndpoint('Review a completed appointment', [UserRole.PATIENT])
  createReview(
    @CurrentUser() user: User,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Body() dto: CreateAppointmentReviewDto,
  ) {
    return this.patientAppointmentsService.createReview(
      user.id,
      appointmentId,
      dto,
    );
  }

  @Get(':appointmentId/review')
  @ApiOkResponse({ type: AppointmentReviewDto })
  @ApiEndpoint('Get the review left on an appointment', [UserRole.PATIENT])
  getReview(
    @CurrentUser() user: User,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
  ) {
    return this.patientAppointmentsService.getReview(user.id, appointmentId);
  }

  @Get('doctors')
  getDepartmentsWithDoctors(@Query('specialtyId') specialtyId?: number) {
    return this.patientAppointmentsService.getDepartmentsWithDoctors(
      specialtyId,
    );
  }

  @Get('doctor-slots/:doctorId')
  getDoctorSlots(
    @Param('doctorId') doctorId: number,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.getDoctorSlots(doctorId, date);
  }
}
