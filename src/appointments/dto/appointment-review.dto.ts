import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentReviewDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  appointment_id: number;

  @ApiProperty()
  score: number;

  @ApiPropertyOptional()
  comment: string | null;

  @ApiProperty()
  created_at: Date;
}

export class DoctorReviewListItemDto extends AppointmentReviewDto {
  @ApiProperty()
  patient_id: number;

  @ApiPropertyOptional()
  patient_name: string | null;

  @ApiProperty()
  appointment_date: string;
}
