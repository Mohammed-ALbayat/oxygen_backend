import { IsDateString, IsOptional, IsString } from 'class-validator';
export class PatientUpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;
}
