import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorFullDto } from './dto/update-doctor.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { PhonenumberDto } from 'src/common/dto/phonenumber.dto';
import { PhonenumberOtpDto } from 'src/common/dto/phonenumber-otp.dto';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';
import { MessageDto } from 'src/common/dto/message.dto';

@ApiBearerAuth()
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(createDoctorDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDoctorFullDto: UpdateDoctorFullDto,
  ) {
    return this.doctorsService.updateDoctor(+id, updateDoctorFullDto);
  }

  @Post('forgot-password')
  @ApiOkResponse({
    type: MessageDto,
  })
  async forgotPassword(@Body() phone: PhonenumberDto) {
    return this.doctorsService.sendOTP(phone.phonenumber);
  }

  @Post('verify-otp')
  @ApiOkResponse({
    type: MessageDto,
  })
  async verifyOtp(@Body() phonenumberOtp: PhonenumberOtpDto) {
    return this.doctorsService.verifyOtp(
      phonenumberOtp.phonenumber,
      phonenumberOtp.otp,
    );
  }

  @Post('reset-password')
  @ApiOkResponse({
    type: MessageDto,
  })
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.doctorsService.resetPassword(
      resetPassword.phonenumber,
      resetPassword.newPassword,
    );
  }
}
