import { Gender } from 'src/users/enums/gender.enum';
import { UserRole } from 'src/users/enums/user-roles.enum';

export class AdminMeResponseDto {
  id: number;
  full_name: string | null;
  role: UserRole;
  phone: string;
  birth_date: Date | null;
  gender: Gender | null;
  image_path: string | null;
}
