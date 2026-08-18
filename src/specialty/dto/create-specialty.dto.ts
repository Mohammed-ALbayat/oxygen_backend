import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsNotEmpty()
  published: boolean;

  @IsString()
  @IsOptional()
  image_path?: string;
}
