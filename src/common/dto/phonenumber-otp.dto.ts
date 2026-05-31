import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PhonenumberOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phonenumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;
}
