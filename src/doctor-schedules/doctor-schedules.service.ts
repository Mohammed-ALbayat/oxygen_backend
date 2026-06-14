import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateDoctorWorkingHoursDto } from './dto/update-doctor-working-hours.dto';
import { Repository } from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';

@Injectable()
export class DoctorSchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async findByDoctorId(doctorId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user_id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('الطبيب غير موجود');
    }

    const schedules = await this.scheduleRepository.find({
      where: { doctor: { user_id: doctorId } },
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });

    return {
      doctor_id: doctorId,
      schedules: schedules.map((schedule) => ({
        id: schedule.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        slot_duration: schedule.slot_duration,
        is_active: schedule.is_active,
      })),
    };
  }

  async updateWorkingHours(doctorId: number, dto: UpdateDoctorWorkingHoursDto) {
    const doctor = await this.doctorRepository.findOne({
      where: { user_id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('الطبيب غير موجود');
    }

    const results: DoctorSchedule[] = [];

    for (const entry of dto.schedules) {
      let schedule = await this.scheduleRepository.findOne({
        where: {
          doctor: { user_id: doctorId },
          day_of_week: entry.day_of_week,
        },
      });

      if (schedule) {
        schedule.start_time = entry.start_time;
        schedule.end_time = entry.end_time;
        schedule.slot_duration = entry.slot_duration;
        schedule.is_active = entry.is_active;
        await this.scheduleRepository.save(schedule);
      } else {
        schedule = this.scheduleRepository.create({
          doctor,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          slot_duration: entry.slot_duration,
          is_active: entry.is_active,
        });
        await this.scheduleRepository.save(schedule);
      }

      results.push(schedule);
    }

    return results;
  }
}
