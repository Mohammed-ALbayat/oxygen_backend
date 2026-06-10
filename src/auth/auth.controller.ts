import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PhonenumberDto } from 'src/common/dto/phonenumber.dto';
import { PhonenumberOtpDto } from 'src/common/dto/phonenumber-otp.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MessageDto } from 'src/common/dto/message.dto';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiEndpoint('Staff login with phone and password', 'public')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOkResponse({
    type: MessageDto,
  })
  @ApiEndpoint('Register new patient', 'public')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('send-otp')
  @ApiOkResponse({
    type: MessageDto,
  })
  @ApiEndpoint(
    'Send OTP code for patient login (expires in 5 minutes)',
    'public',
  )
  sendOtp(@Body() phone: PhonenumberDto) {
    return this.authService.sendOtp(phone.phonenumber);
  }

  @Post('verify-otp')
  @ApiEndpoint('Verify patient OTP and receive JWT access token', 'public')
  verifyOtp(@Body() phonenumberOtp: PhonenumberOtpDto) {
    return this.authService.verifyOtp(
      phonenumberOtp.phonenumber,
      phonenumberOtp.otp,
    );
  }

  @Post('reset-password')
  @ApiEndpoint(
    'Reset password using OTP (doctor, secretary, or admin accounts)',

    'public',
  )
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
