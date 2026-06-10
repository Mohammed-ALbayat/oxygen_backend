import { User } from 'src/users/entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { PatientMeResponseDto } from '../dto/patient-me-response.dto';

export function toPatientMeResponse(
  user: User,
  profile: Patient | null,
): PatientMeResponseDto {
  return {
    id: user.id,
    full_name: user.full_name ?? null,
    phone: user.phone,
    birth_date: user.birth_date ?? null,
    gender: user.gender ?? null,
    address: profile?.address ?? null,
    blood_type: profile?.blood_type ?? null,
    allergies: profile?.allergies ?? null,
    previous_operations: profile?.previous_operations ?? null,
    chronic_diseases: profile?.chronic_diseases ?? null,
    permanent_medications: profile?.permanent_medications ?? null,
    tall: profile?.tall ?? null,
    weight: profile?.weight ?? null,
  };
}

export function isPatientProfileCompleted(user: User | null): boolean {
  if (!user?.patient) {
    return false;
  }

  const profile = user.patient;

  return !!(
    profile.address &&
    profile.blood_type &&
    profile.tall &&
    profile.weight
  );
}
