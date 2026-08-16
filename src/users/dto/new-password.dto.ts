import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class newPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
