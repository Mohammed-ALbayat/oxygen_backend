import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsNumber()
  specialty_id: number;

  @IsString()
  specialization: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNumber()
  examination_price: number;

  @IsNumber()
  doctor_percentage: number;
}