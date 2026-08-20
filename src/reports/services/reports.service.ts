import { Injectable } from '@nestjs/common';
import { DashboardSummaryDto } from '../dto/dashboard-summary.response.dto';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';
import { validateDateRange } from '../utils/date-range.util';
import { CancellationReportsService } from './cancellation-reports.service';
import { RatingsReportsService } from './ratings-reports.service';
import { RevenueReportsService } from './revenue-reports.service';
import { WaitingTimeReportsService } from './waiting-time-reports.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ReportsService {
  constructor(
    private cancellationReportsService: CancellationReportsService,
    private revenueReportsService: RevenueReportsService,
    private ratingsReportsService: RatingsReportsService,
    private waitingTimeReportsService: WaitingTimeReportsService,
    private readonly i18n: I18nService,
  ) {}

  getCancellations(query: ReportDateRangeQueryDto) {
    validateDateRange(query, this.i18n);

    return this.cancellationReportsService.getReport(query);
  }

  getRevenue(query: ReportDateRangeQueryDto) {
    validateDateRange(query, this.i18n);

    return this.revenueReportsService.getReport(query);
  }

  getDoctorRatings(query: ReportDateRangeQueryDto) {
    validateDateRange(query, this.i18n);

    return this.ratingsReportsService.getReport(query);
  }

  getWaitingTime(query: ReportDateRangeQueryDto) {
    validateDateRange(query, this.i18n);

    return this.waitingTimeReportsService.getReport(query);
  }

  async getDashboard(
    query: ReportDateRangeQueryDto,
  ): Promise<DashboardSummaryDto> {
    validateDateRange(query, this.i18n);

    const [cancellations, revenue, doctorRatings, waitingTime] =
      await Promise.all([
        this.cancellationReportsService.getReport(query),
        this.revenueReportsService.getReport(query),
        this.ratingsReportsService.getReport(query),
        this.waitingTimeReportsService.getReport(query),
      ]);

    return {
      from: query.from,
      to: query.to,
      cancellations,
      revenue,
      doctorRatings,
      waitingTime,
    };
  }
}
