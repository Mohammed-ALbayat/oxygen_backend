import { BloodType } from '../entities/patient.entity';
import { Gender } from 'src/users/enums/gender.enum';

export class PatientMeResponseDto {
  id: number;
  full_name: string | null;
  phone: string;
  birth_date: Date | null;
  gender: Gender | null;
  address: string | null;
  blood_type: BloodType | null;
  allergies: string | null;
  previous_operations: string | null;
  chronic_diseases: string | null;
  permanent_medications: string | null;
  tall: number | null;
  weight: number | null;
}
