import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { DoctorSchedulesResponseDto } from './dto/doctor-schedules-response.dto';

@ApiBearerAuth()
@Controller('doctor-schedules')
@UseGuards(JwtAuthGuard)
export class DoctorSchedulesController {
  constructor(
    private readonly doctorSchedulesService: DoctorSchedulesService,
  ) {}

  @Get('doctor/:id')
  @ApiOkResponse({ type: DoctorSchedulesResponseDto })
  findByDoctor(@Param('id') id: string) {
    return this.doctorSchedulesService.findByDoctorId(+id);
  }
}
