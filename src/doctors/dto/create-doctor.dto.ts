import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { WorkingHourDto } from './working-hour.dto';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsPhoneNumber('SY')
  @IsNotEmpty()
  phone_number: string;

  @IsPositive()
  @IsNotEmpty()
  salary: number;

  @IsBoolean()
  @IsNotEmpty()
  published: boolean;

  @IsPositive()
  @IsNotEmpty()
  specialty_id: number;

  @IsString()
  @IsOptional()
  certification?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  working_hours?: WorkingHourDto[];
}
