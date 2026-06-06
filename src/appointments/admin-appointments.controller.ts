import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Post,
  Patch,
  Body,
} from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { MessageDto } from 'src/common/dto/message.dto';
import { AdminAppointmentListItemDto } from './dto/admin-appointment-list-item.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from './entities/appointment.entity';

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
  findAll() {
    return this.adminAppointmentsService.findAll();
  }

  @Delete('cancel/:id')
  @ApiOkResponse({ type: MessageDto })
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  cancel(@Param('id') id: string) {
    return this.adminAppointmentsService.cancel(+id);
  }

  @Get('departments-with-doctors')
  @ApiOkResponse({ type: MessageDto })
  getDepartmentsWithDoctors() {
    return this.adminAppointmentsService.getDepartmentsWithDoctors();
  }

  @Get('doctor-slots/:doctorId/:date')
  @ApiOkResponse({ type: MessageDto })
  getDoctorSlots(
    @Param('doctorId') doctorId: string,
    @Param('date') date: string,
  ) {
    return this.adminAppointmentsService.getDoctorSlots(+doctorId, date);
  }

  @Post('book')
  @ApiOkResponse({ type: MessageDto })
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  adminBookAppointment(@Body() createDto: CreateAppointmentDto) {
    return this.adminAppointmentsService.adminBookAppointment(createDto);
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
}
