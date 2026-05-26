import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { UserRole } from '../entities/user.entity';
import { CreateDoctorDto } from './create-doctor.dto';
import { CreatePatientDto } from './create-patient.dto';

export class CreateUserDto {
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

  @IsOptional()
  doctor?: CreateDoctorDto;

  @IsOptional()
  patient?: CreatePatientDto;

  @IsOptional()
  @IsObject()
  secretary?: {
    shift_start?: string;
    shift_end?: string;
  };
}