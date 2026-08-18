import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
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
  @ApiEndpoint('List of all visits returned successfully', [UserRole.ADMIN])
  findAll() {
    return this.visitsService.findAll();
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
