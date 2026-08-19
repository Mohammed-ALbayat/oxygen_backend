import { User } from 'src/users/entities/user.entity';
import { Secretary } from '../entities/secretary.entity';
import { SecretaryMeResponseDto } from '../dto/secretary-me-response.dto';
import { toStorageUrl } from 'src/storage/utils/storage-url.util';

export function toSecretaryMeResponse(
  user: User,
  profile: Secretary | null,
): SecretaryMeResponseDto {
  return {
    id: user.id,
    full_name: user.full_name ?? null,
    phone: user.phone,
    birth_date: user.birth_date ?? null,
    gender: user.gender ?? null,
    image_path: toStorageUrl(user.image_path),
    shift_start: profile?.shift_start,
    shift_end: profile?.shift_end,
  };
}
