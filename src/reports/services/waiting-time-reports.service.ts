import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';
import { WaitingTimeReportDto } from '../dto/waiting-time-report.response.dto';

@Injectable()
export class WaitingTimeReportsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getReport(
    query: ReportDateRangeQueryDto,
  ): Promise<WaitingTimeReportDto> {
    const [overall, byDepartment] = await Promise.all([
      this.measuredQuery(query)
        .select('AVG(a.waiting_duration_seconds)', 'avgWaitingSeconds')
        .addSelect('COUNT(a.id)', 'sampleSize')
        .getRawOne<{ avgWaitingSeconds: string | null; sampleSize: string }>(),
      this.measuredQuery(query)
        .innerJoin('a.department', 'department')
        .select('department.id', 'departmentId')
        .addSelect('department.title', 'departmentName')
        .addSelect('AVG(a.waiting_duration_seconds)', 'avgWaitingSeconds')
        .addSelect('COUNT(a.id)', 'sampleSize')
        .groupBy('department.id')
        .addGroupBy('department.title')
        .orderBy('avgWaitingSeconds', 'DESC')
        .getRawMany<{
          departmentId: number;
          departmentName: string | null;
          avgWaitingSeconds: string | null;
          sampleSize: string;
        }>(),
    ]);

    const overallAverageSeconds = Math.round(
      Number(overall?.avgWaitingSeconds ?? 0),
    );

    return {
      overallAverageSeconds,
      overallAverageMinutes: toMinutes(overallAverageSeconds),
      sampleSize: Number(overall?.sampleSize ?? 0),
      byDepartment: byDepartment.map((row) => {
        const avgWaitingSeconds = Math.round(
          Number(row.avgWaitingSeconds ?? 0),
        );

        return {
          departmentId: Number(row.departmentId),
          departmentName: row.departmentName,
          avgWaitingSeconds,
          avgWaitingMinutes: toMinutes(avgWaitingSeconds),
          sampleSize: Number(row.sampleSize),
        };
      }),
    };
  }

  /**
   * Only appointments that actually moved from waiting to start carry a measured
   * duration, so everything else is left out of the averages.
   */
  private measuredQuery(
    query: ReportDateRangeQueryDto,
  ): SelectQueryBuilder<Appointment> {
    const qb = this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.waiting_duration_seconds IS NOT NULL')
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

function toMinutes(seconds: number): number {
  return Math.round((seconds / 60) * 100) / 100;
}
