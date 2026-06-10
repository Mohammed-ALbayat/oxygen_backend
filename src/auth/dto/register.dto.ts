import { IsDateString, IsEnum, IsString, Matches } from 'class-validator';
import { Gender } from 'src/users/enums/gender.enum';

export class RegisterDto {
  @IsString()
  @Matches(/^09\d{8}$/, {
    message: 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام',
  })
  phone: string;

  @IsString()
  full_name: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  birthdate: string;
}
