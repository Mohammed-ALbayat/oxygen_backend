import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CancelAppointmentDto {
  @ApiProperty({
    description: 'Id of an active cancellation reason',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  reasonId: number;
}
