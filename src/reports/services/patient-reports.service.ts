import { Injectable } from '@nestjs/common';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';
import { PatientPaymentReportDto } from '../dto/patient-payment-report.response.dto';
import { validateDateRange } from '../utils/date-range.util';
import { PatientFinanceReportsService } from './patient-finance-reports.service';

@Injectable()
export class PatientReportsService {
  constructor(
    private patientFinanceReportsService: PatientFinanceReportsService,
  ) {}

  getPayments(
    patientId: number,
    query: ReportDateRangeQueryDto,
  ): Promise<PatientPaymentReportDto> {
    validateDateRange(query);

    return this.patientFinanceReportsService.getReport(patientId, query);
  }
}
