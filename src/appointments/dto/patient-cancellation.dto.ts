import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelAppointmentDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
