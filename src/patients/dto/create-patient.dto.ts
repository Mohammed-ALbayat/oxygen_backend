import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^09\d{8}$/, {
    message: 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام',
  })
  phone: string;
}
