import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { DayOfWeek } from '../entities/doctor-schedule.entity';

export class CreateDoctorScheduleDto {
  @IsNumber()
  doctor_id: number;

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
