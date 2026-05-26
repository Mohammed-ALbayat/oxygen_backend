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
  update( @Param('id') id: string, @Body() updateDoctorFullDto: UpdateDoctorFullDto,) {
    return this.doctorsService.updateDoctor(+id, updateDoctorFullDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('phone') phone: string) {
    return this.doctorsService.sendOTP(phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.doctorsService.verifyOtp(phone, otp);
  }

  @Post('reset-password')
  async resetPassword(@Body('phone') phone: string, @Body('newPassword') newPassword: string) {
    return this.doctorsService.resetPassword(phone, newPassword);
  }
}
