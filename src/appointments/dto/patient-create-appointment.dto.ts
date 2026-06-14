import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsString } from 'class-validator';

export class PatientCreateAppointmentDto {
  @ApiProperty()
  @IsInt()
  doctorId: number;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  start_time: string;
}
