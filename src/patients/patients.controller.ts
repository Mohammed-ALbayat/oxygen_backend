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
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/common/dto/message.dto';
import { PhonenumberDto } from 'src/common/dto/phonenumber.dto';
import { PhonenumberOtpDto } from 'src/common/dto/phonenumber-otp.dto';

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
  @ApiOkResponse({
    type: MessageDto,
  })
  sendOtp(@Body() phone: PhonenumberDto) {
    return this.patientsService.sendOtp(phone.phonenumber);
  }

  @Post('verify-otp')
  @ApiOkResponse({
    type: MessageDto,
  })
  verifyOtp(@Body() phonenumberOtp: PhonenumberOtpDto) {
    return this.patientsService.verifyOtp(
      phonenumberOtp.phonenumber,
      phonenumberOtp.otp,
    );
  }

  @Post('login')
  @ApiOkResponse({
    type: MessageDto,
  })
  login(@Body() phone: PhonenumberDto) {
    return this.patientsService.loginPatient(phone.phonenumber);
  }
}
