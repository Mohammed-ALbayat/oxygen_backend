import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCancellationReasonDto {
  @ApiProperty({ example: 'Schedule conflict' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;
}
