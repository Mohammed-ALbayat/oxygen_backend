import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorFullDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { DoctorMeResponseDto } from './dto/doctor-me-response.dto';

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiEndpoint('Create a new doctor account and profile', [UserRole.ADMIN])
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(createDoctorDto);
  }

  @Get('me')
  @Roles(UserRole.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: DoctorMeResponseDto })
  @ApiEndpoint('Get current doctor profile and account details', [
    UserRole.DOCTOR,
  ])
  getMe(@CurrentUser() user: User): Promise<DoctorMeResponseDto> {
    return this.doctorsService.getMe(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiEndpoint('Update doctor account and profile by id', [UserRole.ADMIN])
  update(
    @Param('id') id: string,
    @Body() updateDoctorFullDto: UpdateDoctorFullDto,
  ) {
    return this.doctorsService.updateDoctor(+id, updateDoctorFullDto);
  }
}
