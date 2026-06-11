import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AppointmentStatus,
  PaymentStatus,
} from '../entities/appointment.entity';

export class DoctorAppointmentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  patient_id: number;

  @ApiProperty()
  patient_name: string | null;

  @ApiPropertyOptional()
  department_id: number;

  @ApiPropertyOptional()
  department_name: string | null;

  @ApiProperty()
  appointment_date: string;

  @ApiProperty()
  start_time: string;

  @ApiProperty()
  end_time: string;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  //   @ApiProperty({ enum: PaymentStatus })
  //   payment_status: PaymentStatus;

  @ApiPropertyOptional()
  cancellation_reason: string | null;
}
