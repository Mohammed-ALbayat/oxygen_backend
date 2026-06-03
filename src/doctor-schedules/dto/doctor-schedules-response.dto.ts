import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '../entities/doctor-schedule.entity';

export class DoctorScheduleItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: DayOfWeek })
  day_of_week: DayOfWeek;

  @ApiProperty()
  start_time: string;

  @ApiProperty()
  end_time: string;

  @ApiProperty()
  slot_duration: number;

  @ApiProperty()
  is_active: boolean;
}

export class DoctorSchedulesResponseDto {
  @ApiProperty()
  doctor_id: number;

  @ApiProperty({ type: [DoctorScheduleItemDto] })
  schedules: DoctorScheduleItemDto[];
}
