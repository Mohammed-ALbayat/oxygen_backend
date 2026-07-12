import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Roles } from 'src/auth/roles.decorator';
import { PatientVisitsService } from './patient-visits.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { Visit } from './entities/visit.entity';

@ApiTags('Visits Patient')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
@Controller('patient/visits')
export class PatientVisitsController {
  constructor(private readonly visitsService: PatientVisitsService) {}

  @Get()
  @ApiEndpoint('List of the patient\'s visits returned successfully', [UserRole.PATIENT])
  findAll(@CurrentUser() user: User) {
    return this.visitsService.findAll(user.id);
  }

  @Get(':id')
  @ApiEndpoint('Get a single visit by ID', [UserRole.PATIENT])
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.visitsService.findOne(user.id, +id);
  }

  @Get('pdf/download')
  @ApiEndpoint('Download the patient\'s medical record as a PDF file', [UserRole.PATIENT])
  async downloadMedicalRecord(@CurrentUser() user: User, @Res() res: Response) {
    // const visits = await this.visitsService.findAll(user.id);

    const filePath = join(process.cwd(), 'src', 'assets', 'medical-record.pdf');
    const pdfBuffer = await readFile(filePath);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="medical-record.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
