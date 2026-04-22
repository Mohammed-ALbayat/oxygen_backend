import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MinDate,
} from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsPhoneNumber('SY')
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @Type(() => Date)
  @MinDate(new Date('01/01/1900'))
  @IsNotEmpty()
  birth_date: Date;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsOptional()
  blood_type?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  previous_operations?: string;

  @IsString()
  @IsOptional()
  chronic_diseases?: string;

  @IsString()
  @IsOptional()
  permanent_medications?: string;

  @IsPositive()
  @IsOptional()
  tall?: number;

  @IsPositive()
  @IsOptional()
  weight?: number;
}
