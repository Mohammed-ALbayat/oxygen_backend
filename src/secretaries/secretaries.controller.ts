import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { SecretariesService } from './secretaries.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateSecretaryDto } from './dto/create-secretary.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { UpdateSecretaryDto } from './dto/update-secretary.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/common/dto/message.dto';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';
import { PhonenumberDto } from 'src/common/dto/phonenumber.dto';
import { PhonenumberOtpDto } from 'src/common/dto/phonenumber-otp.dto';

@ApiBearerAuth()
@Controller('secretaries')
export class SecretariesController {
  constructor(private readonly secretariesService: SecretariesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSecretaryDto: CreateSecretaryDto) {
    return this.secretariesService.createSecretary(createSecretaryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: number,
    @Body() updateSecretaryDto: UpdateSecretaryDto,
  ) {
    return this.secretariesService.updateSecretary(id, updateSecretaryDto);
  }

  @Post('forgot-password')
  @ApiOkResponse({
    type: MessageDto,
  })
  async forgotPassword(@Body() phone: PhonenumberDto) {
    return this.secretariesService.sendOTP(phone.phonenumber);
  }

  @Post('verify-otp')
  @ApiOkResponse({
    type: MessageDto,
  })
  async verifyOTP(@Body() phonenumberOtp: PhonenumberOtpDto) {
    return this.secretariesService.verifyOtp(
      phonenumberOtp.phonenumber,
      phonenumberOtp.otp,
    );
  }

  @Post('reset-password')
  @ApiOkResponse({
    type: MessageDto,
  })
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.secretariesService.resetPassword(
      resetPassword.phonenumber,
      resetPassword.newPassword,
    );
  }
}
