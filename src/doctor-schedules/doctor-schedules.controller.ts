import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { DoctorSchedulesResponseDto } from './dto/doctor-schedules-response.dto';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiTags('Doctor Schedules')
@ApiBearerAuth()
@Controller('doctor-schedules')
@UseGuards(JwtAuthGuard)
export class DoctorSchedulesController {
  constructor(
    private readonly doctorSchedulesService: DoctorSchedulesService,
  ) {}

  @Get('doctor/:id')
  @ApiOkResponse({ type: DoctorSchedulesResponseDto })
  @ApiEndpoint(
    'Get weekly working schedule for a doctor by id',
    'authenticated',
  )
  findByDoctor(@Param('id') id: string) {
    return this.doctorSchedulesService.findByDoctorId(+id);
  }
}
