import { Gender } from 'src/users/enums/gender.enum';

export class SecretaryMeResponseDto {
  id: number;
  full_name: string | null;
  phone: string;
  birth_date: Date | null;
  gender: Gender | null;
  image_path: string | null | undefined;
  shift_start: string | undefined;
  shift_end: string | undefined;
}
