import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PatientMeResponseDto } from './dto/patient-me-response.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('me')
  @Roles(UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: PatientMeResponseDto })
  @ApiEndpoint('Get current patient profile and account details', [
    UserRole.PATIENT,
  ])
  getMe(@CurrentUser() user: User) {
    return this.patientsService.getMe(user);
  }

  @Put('me')
  @Roles(UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: PatientMeResponseDto })
  @ApiEndpoint('Update current patient account and profile details', [
    UserRole.PATIENT,
  ])
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateMeDto) {
    return this.patientsService.updateMe(user, dto);
  }
}
