import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PatientsService } from '../patients/patients.service';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { VerifyOtpDto } from '../patients/dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly patientsService: PatientsService,
  ) {}




  @Post('create-admin')
  createAdmin() {
    return this.authService.createAdmin();
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }





}