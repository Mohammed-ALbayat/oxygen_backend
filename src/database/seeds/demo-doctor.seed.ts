import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import {
  DayOfWeek,
  DoctorSchedule,
} from 'src/doctor-schedules/entities/doctor-schedule.entity';

const DEMO_DOCTOR_PHONE = '0988888800';
const DEMO_SCHEDULE_DAYS: {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  slot_duration: number;
}[] = [
  {
    day_of_week: DayOfWeek.MONDAY,
    start_time: '09:00',
    end_time: '13:00',
    slot_duration: 30,
  },
  {
    day_of_week: DayOfWeek.WEDNESDAY,
    start_time: '14:00',
    end_time: '18:00',
    slot_duration: 30,
  },
];

@Injectable()
export class DemoDoctorSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
  ) {}

  async seed() {
    const [specialty] = await this.specialtyRepository.find({
      order: { id: 'ASC' },
      take: 1,
    });

    if (!specialty) {
      console.log('Demo doctor seed skipped: no specialties found');
      return;
    }

    let doctor = await this.doctorRepository.findOne({
      where: { user: { phone: DEMO_DOCTOR_PHONE } },
      relations: ['user', 'schedules'],
    });

    if (!doctor) {
      const hashedPassword = await bcrypt.hash('doctor123', 10);

      const user = this.userRepository.create({
        full_name: 'Demo Doctor',
        phone: DEMO_DOCTOR_PHONE,
        password: hashedPassword,
        role: UserRole.DOCTOR,
      });
      const savedUser = await this.userRepository.save(user);

      doctor = this.doctorRepository.create({
        user_id: savedUser.id,
        user: savedUser,
        specialty,
        specialization: 'General Practice',
        bio: 'Demo doctor for admin dashboard testing',
        examination_price: 50,
        doctor_percentage: 15,
        average_rating: 4.8,
      });
      doctor = await this.doctorRepository.save(doctor);
      console.log('Demo doctor seeded successfully');
    } else {
      console.log('Demo doctor already exists');
    }

    for (const entry of DEMO_SCHEDULE_DAYS) {
      const existing = await this.doctorScheduleRepository.findOne({
        where: {
          doctor: { user_id: doctor.user_id },
          day_of_week: entry.day_of_week,
        },
      });

      if (existing) {
        continue;
      }

      const schedule = this.doctorScheduleRepository.create({
        doctor,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        slot_duration: entry.slot_duration,
        is_active: true,
      });
      await this.doctorScheduleRepository.save(schedule);
      console.log(`Demo schedule added: ${entry.day_of_week}`);
    }
  }
}
