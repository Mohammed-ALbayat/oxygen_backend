import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Repository } from 'typeorm';
import {
  DayOfWeek,
  DoctorSchedule,
} from 'src/doctor-schedules/entities/doctor-schedule.entity';

@Injectable()
export class DoctorsSeed {
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
    const count = await this.doctorRepository.count();

    if (count > 0) {
      console.log('Doctors already seeded');
      return;
    }

    const specialties = await this.specialtyRepository.find();

    if (specialties.length === 0) {
      console.log('No specialties found');
      return;
    }

    const hashedPassword = await bcrypt.hash('doctor123', 10);

    for (let i = 0; i < 10; i++) {
      const user = this.userRepository.create({
        full_name: `Doctor ${i}`,
        phone: `099999998${i}`,
        password: hashedPassword,
        role: UserRole.DOCTOR,
      });

      const savedUser = await this.userRepository.save(user);

      const randomSpecialty =
        specialties[Math.floor(Math.random() * specialties.length)];

      const doctor = this.doctorRepository.create({
        user_id: savedUser.id,
        user: savedUser,
        specialty: randomSpecialty,
        specialization: `Specialist ${i}`,
        bio: `This is doctor ${i} bio`,
        examination_price: 20 + i * 5,
        doctor_percentage: 10,
        average_rating: 4.5,
      });

      await this.doctorRepository.save(doctor);

      for (let j = 0; j < 3; j++) {
        const schedule = this.doctorScheduleRepository.create({
          doctor,
          day_of_week: DayOfWeek.FRIDAY,
          start_time: '09:00',
          end_time: '17:00',
          slot_duration: 30,
        });
        await this.doctorScheduleRepository.save(schedule);
      }
    }

    console.log('10 doctors seeded successfully');
  }
}
