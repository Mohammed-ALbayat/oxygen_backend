import { ApiProperty } from '@nestjs/swagger';
import { CancellationReportDto } from './cancellation-report.response.dto';
import { DoctorRatingsReportDto } from './doctor-ratings-report.response.dto';
import { RevenueReportDto } from './revenue-report.response.dto';
import { WaitingTimeReportDto } from './waiting-time-report.response.dto';

export class DashboardSummaryDto {
  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty({ type: CancellationReportDto })
  cancellations: CancellationReportDto;

  @ApiProperty({ type: RevenueReportDto })
  revenue: RevenueReportDto;

  @ApiProperty({ type: DoctorRatingsReportDto })
  doctorRatings: DoctorRatingsReportDto;

  @ApiProperty({ type: WaitingTimeReportDto })
  waitingTime: WaitingTimeReportDto;
}
