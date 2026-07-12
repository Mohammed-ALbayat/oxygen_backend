import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVisitDto {
  @IsInt()
  @IsNotEmpty()
  appointment_id: number;
  @IsString()
  @IsOptional()
  diagnosis: string;
  @IsString()
  @IsOptional()
  medicals: string;
  @IsString()
  @IsOptional()
  suggestions: string;
}
