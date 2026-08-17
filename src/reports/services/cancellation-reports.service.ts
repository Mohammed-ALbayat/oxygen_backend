import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
} from 'src/appointments/entities/appointment.entity';
import { CancellationReportDto } from '../dto/cancellation-report.response.dto';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';

const TOP_REASONS_LIMIT = 10;
const UNSPECIFIED_REASON = 'Unspecified';

@Injectable()
export class CancellationReportsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getReport(
    query: ReportDateRangeQueryDto,
  ): Promise<CancellationReportDto> {
    const [totalCancelled, rows] = await Promise.all([
      this.cancelledQuery(query).getCount(),
      this.cancelledQuery(query)
        .select('a.cancellation_reason', 'reason')
        .addSelect('COUNT(a.id)', 'count')
        .groupBy('a.cancellation_reason')
        .orderBy('count', 'DESC')
        .limit(TOP_REASONS_LIMIT)
        .getRawMany<{ reason: string | null; count: string }>(),
    ]);

    const topReasons = rows.map((row) => {
      const count = Number(row.count);

      return {
        reason: row.reason ?? UNSPECIFIED_REASON,
        count,
        percentage: totalCancelled
          ? Math.round((count / totalCancelled) * 10000) / 100
          : 0,
      };
    });

    return { totalCancelled, topReasons };
  }

  private cancelledQuery(query: ReportDateRangeQueryDto) {
    const qb = this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.status = :status', { status: AppointmentStatus.CANCELLED })
      .andWhere('a.appointment_date BETWEEN :from AND :to', {
        from: query.from,
        to: query.to,
      });

    if (query.departmentId) {
      qb.andWhere('a.department_id = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    return qb;
  }
}
