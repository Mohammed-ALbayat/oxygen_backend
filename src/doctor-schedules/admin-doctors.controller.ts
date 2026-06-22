import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { UpdateDoctorWorkingHoursDto } from './dto/update-doctor-working-hours.dto';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiTags('Doctors Admin')
@ApiBearerAuth()
@Controller('admin/doctors')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminDoctorsController {
  constructor(
    private readonly doctorSchedulesService: DoctorSchedulesService,
  ) {}

  @Put('working-hours/:id')
  @ApiEndpoint('Update doctor weekly working hours by doctor id', [
    UserRole.ADMIN,
  ])
  updateWorkingHours(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorWorkingHoursDto,
  ) {
    return this.doctorSchedulesService.updateWorkingHours(+id, dto);
  }
}
