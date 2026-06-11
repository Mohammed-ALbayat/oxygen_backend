import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { MessageDto } from 'src/common/dto/message.dto';
import { AdminAppointmentListItemDto } from './dto/admin-appointment-list-item.dto';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  AppointmentStatus,
  PaymentStatus,
} from './entities/appointment.entity';

@ApiTags('Admin Appointments')
@ApiBearerAuth()
@Controller('admin/appointments')
@Roles(UserRole.ADMIN, UserRole.SECRETARY)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAppointmentsController {
  constructor(
    private readonly adminAppointmentsService: AdminAppointmentsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: AdminAppointmentListItemDto, isArray: true })
  @ApiEndpoint('List all appointments for admin dashboard', [UserRole.ADMIN])
  findAll() {
    return this.adminAppointmentsService.findAll();
  }

  @Delete('cancel/:id')
  @ApiOkResponse({ type: MessageDto })
  @ApiEndpoint('Cancel an appointment by id', [UserRole.ADMIN])
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  cancel(@Param('id') id: string) {
    return this.adminAppointmentsService.cancel(+id);
  }

  @Patch('update/:id')
  @ApiOkResponse({ type: MessageDto })
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
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
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  updateAppointmentStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.adminAppointmentsService.updateAppointmentStatus(+id, status);
  }

  @Patch('update-payment-status/:id')
  @ApiOkResponse({ type: MessageDto })
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
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
