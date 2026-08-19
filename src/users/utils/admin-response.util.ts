import { User } from 'src/users/entities/user.entity';
import { AdminMeResponseDto } from '../dto/admin-me-response.dto';
import { toStorageUrl } from 'src/storage/utils/storage-url.util';

export function toAdminMeResponse(
  user: User | null,
): AdminMeResponseDto | null {
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    full_name: user.full_name ?? null,
    phone: user.phone,
    birth_date: user.birth_date ?? null,
    gender: user.gender ?? null,
    image_path: toStorageUrl(user.image_path),
  };
}
