import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PatientsService } from '../patients/patients.service'; // استيراد خدمة المرضى
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { VerifyOtpDto } from '../patients/dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly patientsService: PatientsService, // حقن خدمة المرضى هنا
  ) {}

  @Post('register')
  async register(@Body() createPatientDto: CreatePatientDto) {
    // استخدمنا create التي عدلناها سابقاً لتشفير الباسورد ووضع OTP ثابت
    return this.patientsService.create(createPatientDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() VerifyOtpDto:VerifyOtpDto ) {
    return this.patientsService.verifyOtp(VerifyOtpDto.phone, VerifyOtpDto.otp);
  }

  @Post('loginPatient')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { phone: string; pass: string }) {
    return this.authService.loginPatient(body.phone, body.pass);
  }

  @Post('loginDoctor')
  @HttpCode(HttpStatus.OK)
  async loginDoctor(@Body() body: { username: string; pass: string }) {
    return this.authService.loginDoctor(body.username, body.pass);
  }
}