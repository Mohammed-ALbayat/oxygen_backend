import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDoctorFullDto {

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsNumber()
  specialty_id?: number;

  @IsOptional()
  @IsString()
  username: string;
  
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  examination_price?: number;

  @IsOptional()
  @IsNumber()
  doctor_percentage?: number;
}