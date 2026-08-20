import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminDoctorSpecialtyDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;
}

export class AdminDoctorListItemDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  full_name: string | null;

  @ApiPropertyOptional({ nullable: true })
  image_path: string | null;

  @ApiPropertyOptional({ type: AdminDoctorSpecialtyDto })
  specialty: AdminDoctorSpecialtyDto | null;

  @ApiProperty()
  specialization: string;

  @ApiProperty()
  examination_price: number;

  @ApiProperty()
  average_rating: number;
}
