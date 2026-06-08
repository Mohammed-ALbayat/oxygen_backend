import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { BloodType } from '../entities/patient.entity';
import { Gender } from 'src/users/enums/gender.enum';

export class UpdatePatientProfileDto {
  @IsOptional()
  @IsDateString()
  birth_date?: Date;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(BloodType)
  blood_type?: BloodType;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  previous_operations?: string;

  @IsOptional()
  @IsString()
  chronic_diseases?: string;

  @IsOptional()
  @IsString()
  permanent_medications?: string;

  @IsOptional()
  @IsNumber()
  tall?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}
