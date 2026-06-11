import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/common/dto/message.dto';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly AppointmentsService: AppointmentsService) {}

  @Get('departments-with-doctors')
  @ApiOkResponse({ type: MessageDto })
  getDepartmentsWithDoctors() {
    return this.AppointmentsService.getDepartmentsWithDoctors();
  }

  @Get('doctor-slots/:doctorId/:date')
  @ApiOkResponse({ type: MessageDto })
  getDoctorSlots(
    @Param('doctorId') doctorId: string,
    @Param('date') date: string,
  ) {
    return this.AppointmentsService.getDoctorSlots(+doctorId, date);
  }

  @Post()
  @ApiOkResponse({ type: MessageDto })
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createAppointment(@Body() createDto: CreateAppointmentDto) {
    return this.AppointmentsService.createAppointment(createDto);
  }
}
