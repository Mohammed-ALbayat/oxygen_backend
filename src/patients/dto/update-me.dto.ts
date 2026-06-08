import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BloodType } from '../entities/patient.entity';
import { Gender } from 'src/users/enums/gender.enum';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  address?: string;

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
