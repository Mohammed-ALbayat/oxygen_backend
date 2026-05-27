import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

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
  
  @IsEnum(UserRole)
  role: UserRole;
    
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