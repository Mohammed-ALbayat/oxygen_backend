import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsInt()
  doctorId: number;

  @ApiProperty()
  @IsInt()
  patientId: number;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  start_time: string;
}
