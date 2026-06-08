import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePatientProfileDto } from './dto/create-profile-patient.dto';
import { UpdatePatientProfileDto } from './dto/update-profile-patient.dto';
import { AdminPatientsService } from './admin-patients.service';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiBearerAuth()
@Controller('admin/patients')
export class AdminPatientsController {
  constructor(private readonly adminPatientsService: AdminPatientsService) {}

  @Post()
  @ApiEndpoint('Create a new patient account', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.adminPatientsService.createPatient(createPatientDto);
  }

  @Post('profile/:userId')
  @ApiEndpoint('Create a new patient profile', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createProfile(
    @Body() createPatientProfileDto: CreatePatientProfileDto,
    @Param('userId') userId: number,
  ) {
    return this.adminPatientsService.createPatientProfile(
      userId,
      createPatientProfileDto,
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.adminPatientsService.updatePatient(+id, updatePatientDto);
  }

  @Patch('profile/:userId')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateProfile(
    @Body() updatePatientProfileDto: UpdatePatientProfileDto,
    @Param('userId') userId: number,
  ) {
    return this.adminPatientsService.updatePatientProfile(
      userId,
      updatePatientProfileDto,
    );
  }
}
