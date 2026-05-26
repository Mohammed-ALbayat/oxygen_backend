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

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}


  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update( @Param('id') id: string, @Body() updateDoctorFullDto: UpdateDoctorFullDto,) {
    return this.doctorsService.updateDoctor(+id, updateDoctorFullDto);
  }

  @Post('forgot-password')
  @Roles(UserRole.DOCTOR)
  async forgotPassword(@Body('phone') phone: string) {
    return this.doctorsService.forgotPassword(phone);
  }

  @Post('verify-otp')
  @Roles(UserRole.DOCTOR)
  async verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.doctorsService.verifyOtp(phone, otp);
  }

  @Post('reset-password')
  @Roles(UserRole.DOCTOR)
  async resetPassword(@Body('phone') phone: string, @Body('newPassword') newPassword: string) {
    return this.doctorsService.resetPassword(phone, newPassword);
  }
}
