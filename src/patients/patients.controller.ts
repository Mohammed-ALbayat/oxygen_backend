import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post('register')
  register(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.registerPatient(createPatientDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SECRETARY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.createPatient(createPatientDto);
  }

  @Post('profile/:userId')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createProfile(
    @Body() createPatientProfileDto: CreatePatientProfileDto,
    @Param('userId') userId: number,
  ) {
    return this.patientsService.createPatientProfile(
      userId,
      createPatientProfileDto,
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.updatePatient(+id, updatePatientDto);
  }

  @Patch('profile/:userId')
  @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateProfile(
    @Body() updatePatientProfileDto: UpdatePatientProfileDto,
    @Param('userId') userId: number,
  ) {
    return this.patientsService.updatePatientProfile(
      userId,
      updatePatientProfileDto,
    );
  }

  @Post('send-otp')
  sendOtp(@Body('phone') phone: string) {
    return this.patientsService.sendOtp(phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.patientsService.verifyOtp(phone, otp);
  }

  @Post('login')
  login(@Body('phone') phone: string) {
    return this.patientsService.loginPatient(phone);
  }
}
