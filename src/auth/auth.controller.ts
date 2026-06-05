import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PhonenumberDto } from 'src/common/dto/phonenumber.dto';
import { PhonenumberOtpDto } from 'src/common/dto/phonenumber-otp.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/common/dto/message.dto';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-otp')
  @ApiOkResponse({
    type: MessageDto,
  })
  sendOtp(@Body() phone: PhonenumberDto) {
    return this.authService.sendOtp(phone.phonenumber);
  }

  @Post('verify-otp')
  verifyOtp(@Body() phonenumberOtp: PhonenumberOtpDto) {
    return this.authService.verifyOtp(
      phonenumberOtp.phonenumber,
      phonenumberOtp.otp,
    );
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
