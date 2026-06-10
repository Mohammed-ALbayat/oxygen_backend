import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from 'src/doctor-schedules/entities/doctor-schedule.entity';
export class DoctorScheduleDto {
  @ApiProperty({ enum: DayOfWeek })
  day_of_week: DayOfWeek;

  @ApiProperty()
  start_time: string;

  @ApiProperty()
  end_time: string;
}

export class DoctorWithScheduleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [DoctorScheduleDto] })
  schedules: DoctorScheduleDto[];
}

export class DepartmentDoctorsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [DoctorWithScheduleDto] })
  doctors: DoctorWithScheduleDto[];
}
