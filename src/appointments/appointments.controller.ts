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
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/common/dto/message.dto';
import { AppointmentsService } from './appointments.service';

@ApiBearerAuth()
@Controller('appointments')
// @Roles(UserRole.ADMIN, UserRole.SECRETARY)
// @UseGuards(JwtAuthGuard, RolesGuard)
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
}
