import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { MessageDto } from 'src/common/dto/message.dto';
import { AdminAppointmentListItemDto } from './dto/admin-appointment-list-item.dto';

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
}
