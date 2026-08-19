import { Controller, Delete, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminVisitsService } from './admin-visits.service';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiTags('Visits Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SECRETARY)
@Controller('admin/visits')
export class AdminVisitsController {
  constructor(private readonly visitsService: AdminVisitsService) {}

  @Get()
  @ApiEndpoint('List all visits, optionally filtered by patient id', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('patient_id', new ParseIntPipe({ optional: true }))
    patientId?: number,
  ) {
    return this.visitsService.findAll(page, limit, patientId);
  }
  
  @Get(':id')
  @ApiEndpoint('Get a single visit by ID', [UserRole.ADMIN])
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(+id);
  }

  @Delete(':id')
  @ApiEndpoint('Delete a visit', [UserRole.ADMIN])
  remove(@Param('id') id: string) {
    return this.visitsService.remove(+id);
  }
}
