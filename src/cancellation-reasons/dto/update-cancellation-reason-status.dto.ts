import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCancellationReasonStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
