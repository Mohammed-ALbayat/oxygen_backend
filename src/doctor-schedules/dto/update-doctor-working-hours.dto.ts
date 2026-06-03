import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from '../entities/doctor-schedule.entity';

export class WorkingHoursEntryDto {
  @IsEnum(DayOfWeek)
  day_of_week: DayOfWeek;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsNumber()
  slot_duration: number;

  @IsBoolean()
  is_active: boolean;
}

export class UpdateDoctorWorkingHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursEntryDto)
  schedules: WorkingHoursEntryDto[];
}
