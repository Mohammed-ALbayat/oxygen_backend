import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Gender } from 'src/users/enums/gender.enum';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';

export class DoctorMeResponseDto {
  id: number;
  full_name: string | null;
  phone: string;
  birth_date: Date | null;
  gender: Gender | null;
  image_path: string | null | undefined;
  specialty: Specialty | null;
  schedules: DoctorSchedule[] | null;
  specialization: string | null;
  bio: string | null;
  examination_price: number | null;
  doctor_percentage: number | null;
  average_rating: number | null;
}
