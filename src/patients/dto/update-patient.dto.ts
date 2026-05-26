import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePatientDto {

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  username?: string;
}