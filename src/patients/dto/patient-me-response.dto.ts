import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BloodType, Gender } from '../entities/patient.entity';

export class PatientProfileResponseDto {
  birth_date?: Date | null;
  address?: string | null;
  gender?: Gender | null;
  blood_type?: BloodType | null;
  allergies?: string | null;
  previous_operations?: string | null;
  chronic_diseases?: string | null;
  permanent_medications?: string | null;
  tall?: number | null;
  weight?: number | null;
}

export class PatientMeResponseDto {
  id: number;
  full_name: string;
  phone: string;
  profile: PatientProfileResponseDto | null;
}
