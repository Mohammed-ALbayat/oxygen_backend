import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/users/entities/user.entity';
import { Column } from 'typeorm';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  password?: string;
  
  @IsString()
  username: string;
    
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