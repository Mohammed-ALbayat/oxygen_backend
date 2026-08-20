import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { PatientPaymentReportDto } from './dto/patient-payment-report.response.dto';
import { ReportDateRangeQueryDto } from './dto/report-date-range.query.dto';
import { PatientReportsService } from './services/patient-reports.service';

@ApiTags('Reports Patient')
@ApiBearerAuth()
@Controller('patient/reports')
@Roles(UserRole.PATIENT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientReportsController {
  constructor(private readonly patientReportsService: PatientReportsService) {}

  @Get('payments')
  @ApiOkResponse({ type: PatientPaymentReportDto })
  @ApiEndpoint(
    'Deposit and full fee payments for the current patient, with date range filter',
    [UserRole.PATIENT],
  )
  getPayments(
    @CurrentUser() user: User,
    @Query() query: ReportDateRangeQueryDto,
  ) {
    return this.patientReportsService.getPayments(user.id, query);
  }
}
