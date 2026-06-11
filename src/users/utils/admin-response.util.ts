import { User } from 'src/users/entities/user.entity';
import { AdminMeResponseDto } from '../dto/admin-me-response.dto';

export function toAdminMeResponse(user: User): AdminMeResponseDto {
  return {
    id: user.id,
    full_name: user.full_name ?? null,
    phone: user.phone,
    birth_date: user.birth_date ?? null,
    gender: user.gender ?? null,
  };
}
