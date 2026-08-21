import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
  Query,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { MessageDto } from 'src/common/dto/message.dto';
import { AdminCreateAppointmentDto } from './dto/admin-create-appointment.dto';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { UpdateAppointmentDto } from './dto/admin-update-appointment.dto';
import {
  AppointmentStatus,
  PaymentStatus,
} from './entities/appointment.entity';

@ApiTags('Appointments Admin')
@ApiBearerAuth()
@Controller('admin/appointments')
@Roles(UserRole.ADMIN, UserRole.SECRETARY)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAppointmentsController {
  constructor(
    private readonly adminAppointmentsService: AdminAppointmentsService,
  ) {}

  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'patient_id', required: false, type: Number })
  @ApiQuery({ name: 'specialty_id', required: false, type: Number })
  @ApiQuery({
    name: 'appointment_status',
    required: false,
    enum: AppointmentStatus,
  })
  @Get()
  @ApiEndpoint('List all appointments for admin dashboard', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('patient_id', new ParseIntPipe({ optional: true }))
    patientId?: number,
    @Query('specialty_id', new ParseIntPipe({ optional: true }))
    specialtyId?: number,
    @Query('appointment_status') appointment_status?: AppointmentStatus,
  ) {
    return this.adminAppointmentsService.findAll(
      page,
      limit,
      appointment_status,
      patientId,
      specialtyId,
    );
  }

  @Post()
  @ApiOkResponse({ type: MessageDto })
  @ApiEndpoint(
    'Create a new appointment and assign it to a patient',
    [UserRole.ADMIN, UserRole.SECRETARY],
  )
  createAppointment(@Body() dto: AdminCreateAppointmentDto) {
    return this.adminAppointmentsService.createAppointment(dto);
  }

  @ApiQuery({ name: 'date', required: false, type: String })
  @Get('doctor-slots/:doctorId')
  @ApiEndpoint(
    'Get available time slots for a doctor to help booking a new appointment',
    [UserRole.ADMIN, UserRole.SECRETARY],
  )
  getDoctorSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('date') date?: string,
  ) {
    return this.adminAppointmentsService.getDoctorSlots(doctorId, date);
  }

  @ApiQuery({ name: 'reasonId', required: false, type: Number })
  @ApiQuery({ name: 'reason', required: false, type: String })
  @Delete('cancel/:id')
  @ApiOkResponse({ type: MessageDto })
  @ApiEndpoint(
    'Cancel an appointment by id. Prefer reasonId to reference a managed cancellation reason; reason is a free-text fallback.',
    [UserRole.ADMIN, UserRole.SECRETARY],
  )
  cancel(
    @Param('id') id: string,
    @Query('reason') reason: string = 'Cancelled by admin',
    @Query('reasonId') reasonId?: string,
  ) {
    return this.adminAppointmentsService.cancel(
      +id,
      reason,
      reasonId ? +reasonId : undefined,
    );
  }

  @Patch('update/:id')
  @ApiOkResponse({ type: MessageDto })
  @ApiEndpoint('Update an appointment date or time', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  updateAppointment(
    @Param('id') appointmentId: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.adminAppointmentsService.adminUpdateAppointment(
      +appointmentId,
      dto,
    );
  }

  @Patch('update-status/:id')
  @ApiOkResponse({ type: MessageDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(AppointmentStatus),
          example: AppointmentStatus.WAITING,
        },
      },
      required: ['status'],
    },
  })
  @ApiEndpoint('Update an appointment status', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  updateAppointmentStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.adminAppointmentsService.updateAppointmentStatus(+id, status);
  }

  @Patch('update-payment-status/:id')
  @ApiOkResponse({ type: MessageDto })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentStatus: {
          type: 'string',
          enum: Object.values(PaymentStatus),
          example: PaymentStatus.PAID,
        },
      },
      required: ['paymentStatus'],
    },
  })
  @ApiEndpoint('Update an appointment payment status', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  updateAppointmentPaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.adminAppointmentsService.updateAppointmentPaymentStatus(
      +id,
      paymentStatus,
    );
  }
}
