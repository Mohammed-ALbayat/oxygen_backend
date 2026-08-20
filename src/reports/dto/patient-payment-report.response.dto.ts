import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from 'src/appointments/entities/appointment.entity';

export class PatientPaymentItemDto {
  @ApiProperty()
  appointmentId: number;

  @ApiProperty({ example: '2026-03-15' })
  appointmentDate: string;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ nullable: true })
  depositAmount: number | null;

  @ApiPropertyOptional({ nullable: true })
  collectedAmount: number | null;

  @ApiPropertyOptional({ nullable: true })
  doctorName: string | null;

  @ApiPropertyOptional({ nullable: true })
  departmentTitle: string | null;
}

export class PatientPaymentReportDto {
  @ApiProperty({ example: '2026-01-01' })
  from: string;

  @ApiProperty({ example: '2026-12-31' })
  to: string;

  @ApiProperty({ description: 'Deposits plus full fees, minus refunds' })
  totalPaid: number;

  @ApiProperty()
  depositPaid: number;

  @ApiProperty()
  fullFeePaid: number;

  @ApiProperty({ description: 'Total amount refunded in the range' })
  refunds: number;

  @ApiProperty({ type: PatientPaymentItemDto, isArray: true })
  appointments: PatientPaymentItemDto[];
}
