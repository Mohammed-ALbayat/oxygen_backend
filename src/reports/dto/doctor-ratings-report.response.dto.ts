import { ApiProperty } from '@nestjs/swagger';

export class DoctorRatingDto {
  @ApiProperty()
  doctorId: number;

  @ApiProperty()
  doctorName: string | null;

  @ApiProperty({ description: 'Average score of reviews inside the range' })
  averageScore: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty({
    description: 'All-time cached rating on the doctor profile',
  })
  profileAverageRating: number;
}

export class DoctorRatingsReportDto {
  @ApiProperty({ type: DoctorRatingDto, isArray: true })
  doctors: DoctorRatingDto[];
}
