import { IsOptional, IsString } from 'class-validator';
import { UserRole } from '../enums/user-roles.enum';
import { Gender } from '../enums/gender.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  full_name?: string | null;

  @IsOptional()
  @ApiProperty()
  @IsString()
  phone?: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  password?: string | null;

  @IsOptional()
  @ApiProperty()
  @IsString()
  role?: UserRole;

  @IsOptional()
  @ApiProperty()
  @IsString()
  birth_date?: Date | null;

  @IsOptional()
  @ApiProperty()
  @IsString()
  gender?: Gender | null;

  @IsOptional()
  @ApiProperty()
  @IsString()
  image_path?: string | null;
}
