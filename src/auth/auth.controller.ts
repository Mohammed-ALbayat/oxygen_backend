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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { phone: string; pass: string }) {
    return this.authService.login(body.phone, body.pass);
  }
}