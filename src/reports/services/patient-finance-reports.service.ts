import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Appointment,
  DEPOSIT_AMOUNT,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';
import {
  PatientPaymentItemDto,
  PatientPaymentReportDto,
} from '../dto/patient-payment-report.response.dto';

const DEPOSIT_PAID_SQL = `SUM(CASE WHEN a.payment_status = :depositPaid THEN COALESCE(a.deposit_amount, :depositAmount) ELSE 0 END)`;
const FULL_FEE_PAID_SQL = `SUM(CASE WHEN a.payment_status = :paid THEN COALESCE(a.collected_amount, doctor.examination_price) ELSE 0 END)`;
const REFUNDS_SQL = `SUM(CASE WHEN a.payment_status = :refunded THEN COALESCE(a.collected_amount, 0) ELSE 0 END)`;

@Injectable()
export class PatientFinanceReportsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getReport(
    patientId: number,
    query: ReportDateRangeQueryDto,
  ): Promise<PatientPaymentReportDto> {
    const [totals, appointments] = await Promise.all([
      this.baseQuery(patientId, query)
        .select(DEPOSIT_PAID_SQL, 'depositPaid')
        .addSelect(FULL_FEE_PAID_SQL, 'fullFeePaid')
        .addSelect(REFUNDS_SQL, 'refunds')
        .getRawOne<{
          depositPaid: string | null;
          fullFeePaid: string | null;
          refunds: string | null;
        }>(),
      this.baseQuery(patientId, query)
        .leftJoin('a.department', 'department')
        .leftJoin('doctor.user', 'doctorUser')
        .select('a.id', 'appointmentId')
        .addSelect('a.appointment_date', 'appointmentDate')
        .addSelect('a.payment_status', 'paymentStatus')
        .addSelect('a.deposit_amount', 'depositAmount')
        .addSelect('a.collected_amount', 'collectedAmount')
        .addSelect('doctorUser.full_name', 'doctorName')
        .addSelect('department.title', 'departmentTitle')
        .orderBy('a.appointment_date', 'DESC')
        .addOrderBy('a.id', 'DESC')
        .getRawMany<{
          appointmentId: number;
          appointmentDate: Date | string;
          paymentStatus: PaymentStatus;
          depositAmount: string | number | null;
          collectedAmount: string | number | null;
          doctorName: string | null;
          departmentTitle: string | null;
        }>(),
    ]);

    const depositPaid = Number(totals?.depositPaid ?? 0);
    const fullFeePaid = Number(totals?.fullFeePaid ?? 0);
    const refunds = Number(totals?.refunds ?? 0);

    return {
      from: query.from,
      to: query.to,
      totalPaid: depositPaid + fullFeePaid - refunds,
      depositPaid,
      fullFeePaid,
      refunds,
      appointments: appointments.map((row) => this.toPaymentItem(row)),
    };
  }

  private baseQuery(
    patientId: number,
    query: ReportDateRangeQueryDto,
  ): SelectQueryBuilder<Appointment> {
    const qb = this.appointmentRepository
      .createQueryBuilder('a')
      .leftJoin('a.doctor', 'doctor')
      .where('a.patient_id = :patientId', { patientId })
      .andWhere('a.appointment_date BETWEEN :from AND :to', {
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

  private toPaymentItem(row: {
    appointmentId: number;
    appointmentDate: Date | string;
    paymentStatus: PaymentStatus;
    depositAmount: string | number | null;
    collectedAmount: string | number | null;
    doctorName: string | null;
    departmentTitle: string | null;
  }): PatientPaymentItemDto {
    const appointmentDate =
      row.appointmentDate instanceof Date
        ? row.appointmentDate.toISOString().slice(0, 10)
        : String(row.appointmentDate).slice(0, 10);

    return {
      appointmentId: Number(row.appointmentId),
      appointmentDate,
      paymentStatus: row.paymentStatus,
      depositAmount: this.toNullableNumber(row.depositAmount),
      collectedAmount: this.toNullableNumber(row.collectedAmount),
      doctorName: row.doctorName,
      departmentTitle: row.departmentTitle,
    };
  }

  private toNullableNumber(
    value: string | number | null | undefined,
  ): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number(value);
  }
}
