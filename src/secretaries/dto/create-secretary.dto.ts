import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSecretaryDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  shift_start?: string;

  @IsOptional()
  @IsString()
  shift_end?: string;
}
