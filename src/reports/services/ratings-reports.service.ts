import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentReview } from 'src/appointments/entities/appointment-review.entity';
import { AppointmentStatus } from 'src/appointments/entities/appointment.entity';
import { DoctorRatingsReportDto } from '../dto/doctor-ratings-report.response.dto';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';

@Injectable()
export class RatingsReportsService {
  constructor(
    @InjectRepository(AppointmentReview)
    private reviewRepository: Repository<AppointmentReview>,
  ) {}

  async getReport(
    query: ReportDateRangeQueryDto,
  ): Promise<DoctorRatingsReportDto> {
    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.appointment', 'appointment')
      .innerJoin('appointment.doctor', 'doctor')
      .innerJoin('doctor.user', 'user')
      .select('doctor.user_id', 'doctorId')
      .addSelect('user.full_name', 'doctorName')
      .addSelect('AVG(review.score)', 'averageScore')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .addSelect('doctor.average_rating', 'profileAverageRating')
      .where('DATE(review.created_at) BETWEEN :from AND :to', {
        from: query.from,
        to: query.to,
      })
      .andWhere('appointment.status = :complete', {
        complete: AppointmentStatus.COMPLETE,
      })
      .groupBy('doctor.user_id')
      .addGroupBy('user.full_name')
      .addGroupBy('doctor.average_rating')
      .orderBy('averageScore', 'DESC');

    if (query.departmentId) {
      qb.andWhere('appointment.department_id = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    const rows = await qb.getRawMany<{
      doctorId: number;
      doctorName: string | null;
      averageScore: string | null;
      reviewCount: string;
      profileAverageRating: string | null;
    }>();

    return {
      doctors: rows.map((row) => ({
        doctorId: Number(row.doctorId),
        doctorName: row.doctorName,
        averageScore: Math.round(Number(row.averageScore ?? 0) * 100) / 100,
        reviewCount: Number(row.reviewCount),
        profileAverageRating: Number(row.profileAverageRating ?? 0),
      })),
    };
  }
}
