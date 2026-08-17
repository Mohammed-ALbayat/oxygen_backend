import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Appointment,
  DEPOSIT_AMOUNT,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';
import { RevenueReportDto } from '../dto/revenue-report.response.dto';

const DEPOSIT_REVENUE_SQL = `SUM(CASE WHEN a.payment_status = :depositPaid THEN COALESCE(a.deposit_amount, :depositAmount) ELSE 0 END)`;
const FULL_FEE_REVENUE_SQL = `SUM(CASE WHEN a.payment_status = :paid THEN COALESCE(a.collected_amount, doctor.examination_price) ELSE 0 END)`;
const REFUNDS_SQL = `SUM(CASE WHEN a.payment_status = :refunded THEN COALESCE(a.collected_amount, 0) ELSE 0 END)`;

@Injectable()
export class RevenueReportsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getReport(query: ReportDateRangeQueryDto): Promise<RevenueReportDto> {
    const [totals, breakdown] = await Promise.all([
      this.baseQuery(query)
        .select(DEPOSIT_REVENUE_SQL, 'depositRevenue')
        .addSelect(FULL_FEE_REVENUE_SQL, 'fullFeeRevenue')
        .addSelect(REFUNDS_SQL, 'refunds')
        .getRawOne<{
          depositRevenue: string | null;
          fullFeeRevenue: string | null;
          refunds: string | null;
        }>(),
      this.baseQuery(query)
        .innerJoin('a.department', 'department')
        .select('department.id', 'departmentId')
        .addSelect('department.title', 'title')
        .addSelect(
          `${DEPOSIT_REVENUE_SQL} + ${FULL_FEE_REVENUE_SQL} - ${REFUNDS_SQL}`,
          'revenue',
        )
        .groupBy('department.id')
        .addGroupBy('department.title')
        .orderBy('revenue', 'DESC')
        .getRawMany<{
          departmentId: number;
          title: string | null;
          revenue: string | null;
        }>(),
    ]);

    const depositRevenue = Number(totals?.depositRevenue ?? 0);
    const fullFeeRevenue = Number(totals?.fullFeeRevenue ?? 0);
    const refunds = Number(totals?.refunds ?? 0);

    return {
      totalRevenue: depositRevenue + fullFeeRevenue - refunds,
      depositRevenue,
      fullFeeRevenue,
      refunds,
      breakdownByDepartment: breakdown.map((row) => ({
        departmentId: Number(row.departmentId),
        title: row.title,
        revenue: Number(row.revenue ?? 0),
      })),
    };
  }

  private baseQuery(
    query: ReportDateRangeQueryDto,
  ): SelectQueryBuilder<Appointment> {
    const qb = this.appointmentRepository
      .createQueryBuilder('a')
      .leftJoin('a.doctor', 'doctor')
      .where('a.appointment_date BETWEEN :from AND :to', {
        from: query.from,
        to: query.to,
      })
      .setParameters({
        depositPaid: PaymentStatus.DEPOSIT_PAID,
        paid: PaymentStatus.PAID,
        refunded: PaymentStatus.REFUNDED,
        depositAmount: DEPOSIT_AMOUNT,
      });

    if (query.departmentId) {
      qb.andWhere('a.department_id = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    return qb;
  }
}
