import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PhonenumberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phonenumber: string;
}
