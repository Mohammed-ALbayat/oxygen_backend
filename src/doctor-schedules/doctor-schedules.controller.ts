import { Controller, UseGuards } from '@nestjs/common';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { Body, Post, Param } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('doctor-schedules')
export class DoctorSchedulesController {
  constructor(
    private readonly doctorSchedulesService: DoctorSchedulesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createDoctorScheduleDto: CreateDoctorScheduleDto) {
    return this.doctorSchedulesService.create(createDoctorScheduleDto);
  }

  @Post('multiple/:doctorId')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createMultiple(
    @Param('doctorId') doctorId: number,
    @Body() schedules: CreateDoctorScheduleDto[],
  ) {
    return this.doctorSchedulesService.createMultiple(doctorId, schedules);
  }
}
