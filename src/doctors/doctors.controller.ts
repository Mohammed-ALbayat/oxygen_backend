import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorFullDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

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
