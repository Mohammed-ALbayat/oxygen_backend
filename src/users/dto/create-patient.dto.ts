import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';
import { BloodType } from 'src/patients/entities/patient.entity';

export class CreatePatientDto {
  @IsOptional()
  birth_date?: Date;

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
  chronic_diseases?: string;

  @IsOptional()
  @IsString()
  previous_operations?: string;

  @IsOptional()
  @IsString()
  permanent_medications?: string;

  @IsOptional()
  @IsNumber()
  tall?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  address?: string;
}