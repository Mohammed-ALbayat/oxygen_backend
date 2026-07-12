import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiAcceptedResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Roles } from 'src/auth/roles.decorator';
import { DoctorVisitsService } from './doctor-visits.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiTags('Visits Doctor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
@Controller('doctor/visits')
export class DoctorVisitsController {
  constructor(private readonly visitsService: DoctorVisitsService) {}

  @Post()
  @ApiEndpoint('Create a new visit linked to an appointment', [UserRole.DOCTOR])
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitsService.create(createVisitDto);
  }

  @Get()
  @ApiEndpoint('List of the doctor\'s visits returned successfully', [UserRole.DOCTOR])
  findAll(@CurrentUser() user: User) {
    return this.visitsService.findAll(user.id);
  }

  @Get(':id')
  @ApiEndpoint('Get a single visit by ID', [UserRole.DOCTOR])
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.visitsService.findOne(user.id, +id);
  }

  @Get('patient_visits/:patient_id')
  @ApiEndpoint('Get all visits for a specific patient', [UserRole.DOCTOR])
  patientVisits(
    @CurrentUser() user: User,
    @Param('patient_id') patient_id: string,
  ) {
    return this.visitsService.patientVisits(user.id, +patient_id);
  }

  @Patch(':id')
  @ApiEndpoint('Update a visit\'s medical information', [UserRole.DOCTOR])
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateVisitDto: UpdateVisitDto,
  ) {
    return this.visitsService.update(user.id, +id, updateVisitDto);
  }

  @Delete(':id')
  @ApiEndpoint('Delete a visit', [UserRole.DOCTOR])
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.visitsService.remove(user.id, +id);
  }
}
