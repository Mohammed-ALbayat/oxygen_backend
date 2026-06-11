import { User } from 'src/users/entities/user.entity';
import { Doctor } from '../entities/doctor.entity';
import { DoctorMeResponseDto } from '../dto/doctor-me-response.dto';

export function toDoctorMeResponse(
  user: User,
  profile: Doctor | null,
): DoctorMeResponseDto {
  return {
    id: user.id,
    full_name: user.full_name ?? null,
    phone: user.phone,
    birth_date: user.birth_date ?? null,
    gender: user.gender ?? null,
    specialty: profile?.specialty ?? null,
    schedules: profile?.schedules ?? null,
    specialization: profile?.specialization ?? null,
    bio: profile?.bio ?? null,
    examination_price: profile?.examination_price ?? null,
    doctor_percentage: profile?.doctor_percentage ?? null,
    average_rating: profile?.average_rating ?? null,
  };
}
