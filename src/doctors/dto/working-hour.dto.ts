import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { DaysOfWeek } from 'src/common/enums/day-of-week.enum';

export class WorkingHourDto {
  @IsEnum(DaysOfWeek)
  @IsNotEmpty()
  day: DaysOfWeek;

  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;
}
