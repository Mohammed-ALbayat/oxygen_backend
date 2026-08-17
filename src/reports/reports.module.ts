import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentReview } from 'src/appointments/entities/appointment-review.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AdminReportsController } from './admin-reports.controller';
import { CancellationReportsService } from './services/cancellation-reports.service';
import { RatingsReportsService } from './services/ratings-reports.service';
import { ReportsService } from './services/reports.service';
import { RevenueReportsService } from './services/revenue-reports.service';
import { WaitingTimeReportsService } from './services/waiting-time-reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, AppointmentReview])],
  controllers: [AdminReportsController],
  providers: [
    ReportsService,
    CancellationReportsService,
    RevenueReportsService,
    RatingsReportsService,
    WaitingTimeReportsService,
  ],
})
export class ReportsModule {}
