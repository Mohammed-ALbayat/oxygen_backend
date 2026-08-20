import { Injectable } from '@nestjs/common';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';
import { PatientPaymentReportDto } from '../dto/patient-payment-report.response.dto';
import { validateDateRange } from '../utils/date-range.util';
import { PatientFinanceReportsService } from './patient-finance-reports.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PatientReportsService {
  constructor(
    private patientFinanceReportsService: PatientFinanceReportsService,
    private readonly i18n: I18nService,
  ) {}

  getPayments(
    patientId: number,
    query: ReportDateRangeQueryDto,
  ): Promise<PatientPaymentReportDto> {
    validateDateRange(query, this.i18n);

    return this.patientFinanceReportsService.getReport(patientId, query);
  }
}
