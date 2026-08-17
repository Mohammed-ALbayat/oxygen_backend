import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { DoctorAppointmentsService } from './doctor-appointments.service';

@ApiTags('Appointments Doctor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller('doctor/reviews')
export class DoctorReviewsController {
  constructor(
    private readonly doctorAppointmentsService: DoctorAppointmentsService,
  ) {}

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  @ApiEndpoint('List reviews left on the doctor own appointments', [
    UserRole.DOCTOR,
  ])
  getDoctorReviews(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.doctorAppointmentsService.getDoctorReviews(
      user.id,
      +page,
      +limit,
    );
  }
}
