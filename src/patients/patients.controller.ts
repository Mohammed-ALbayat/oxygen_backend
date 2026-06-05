import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreatePatientProfileDto } from './dto/create-profile-patient.dto';
import { UpdatePatientProfileDto } from './dto/update-profile-patient.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PatientMeResponseDto } from './dto/patient-me-response.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('me')
  @Roles(UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: PatientMeResponseDto })
  getMe(@CurrentUser() user: User) {
    return this.patientsService.getMe(user);
  }

  @Put('me')
  @Roles(UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: PatientMeResponseDto })
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateMeDto) {
    return this.patientsService.updateMe(user, dto);
  }
}
