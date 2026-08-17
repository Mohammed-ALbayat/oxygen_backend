import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { CancellationReportDto } from './dto/cancellation-report.response.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.response.dto';
import { DoctorRatingsReportDto } from './dto/doctor-ratings-report.response.dto';
import { ReportDateRangeQueryDto } from './dto/report-date-range.query.dto';
import { RevenueReportDto } from './dto/revenue-report.response.dto';
import { WaitingTimeReportDto } from './dto/waiting-time-report.response.dto';
import { ReportsService } from './services/reports.service';

@ApiTags('Reports Admin')
@ApiBearerAuth()
@Controller('admin/reports')
@Roles(UserRole.ADMIN, UserRole.SECRETARY)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOkResponse({ type: DashboardSummaryDto })
  @ApiEndpoint('Summary of every report metric for the given date range', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  getDashboard(@Query() query: ReportDateRangeQueryDto) {
    return this.reportsService.getDashboard(query);
  }

  @Get('cancellations')
  @ApiOkResponse({ type: CancellationReportDto })
  @ApiEndpoint('Total cancellations and the most frequent reasons', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  getCancellations(@Query() query: ReportDateRangeQueryDto) {
    return this.reportsService.getCancellations(query);
  }

  @Get('revenue')
  @ApiOkResponse({ type: RevenueReportDto })
  @ApiEndpoint('Deposit and full fee revenue, net of refunds', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  getRevenue(@Query() query: ReportDateRangeQueryDto) {
    return this.reportsService.getRevenue(query);
  }

  @Get('doctor-ratings')
  @ApiOkResponse({ type: DoctorRatingsReportDto })
  @ApiEndpoint('Average score and review count per doctor', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  getDoctorRatings(@Query() query: ReportDateRangeQueryDto) {
    return this.reportsService.getDoctorRatings(query);
  }

  @Get('waiting-time')
  @ApiOkResponse({ type: WaitingTimeReportDto })
  @ApiEndpoint('Average patient waiting time grouped by department', [
    UserRole.ADMIN,
    UserRole.SECRETARY,
  ])
  getWaitingTime(@Query() query: ReportDateRangeQueryDto) {
    return this.reportsService.getWaitingTime(query);
  }
}
