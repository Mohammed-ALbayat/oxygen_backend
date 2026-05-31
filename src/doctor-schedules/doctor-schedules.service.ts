import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { Repository } from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

@Injectable()
export class DoctorSchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(dto: CreateDoctorScheduleDto) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: dto.doctor_id },
    });

    if (!doctor) {
      throw new NotFoundException('الطبيب غير موجود');
    }

    const existing = await this.scheduleRepository.findOne({
      where: {
        doctor: { id: dto.doctor_id },
        // day_of_week: dto.day_of_week,
      },
    });

    if (existing) {
      throw new ConflictException('يوجد دوام مسبق لهذا اليوم');
    }

    const schedule = this.scheduleRepository.create({
      doctor,
      day_of_week: dto.day_of_week,
      start_time: dto.start_time,
      end_time: dto.end_time,
      slot_duration: dto.slot_duration,
      is_active: dto.is_active,
    });

    return await this.scheduleRepository.save(schedule);
  }

  async createMultiple(doctorId: number, schedules: CreateDoctorScheduleDto[]) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('الطبيب غير موجود');
    }

    const results: DoctorSchedule[] = [];

    for (const scheduleDto of schedules) {
      // شوف إذا اليوم موجود مسبقاً
      let schedule = await this.scheduleRepository.findOne({
        where: {
          doctor: { id: doctorId },
          day_of_week: scheduleDto.day_of_week,
        },
      });

      // إذا موجود → update
      if (schedule) {
        schedule.start_time = scheduleDto.start_time;
        schedule.end_time = scheduleDto.end_time;
        schedule.slot_duration = scheduleDto.slot_duration;
        schedule.is_active = scheduleDto.is_active;

        await this.scheduleRepository.save(schedule);
      }

      // إذا غير موجود → create
      else {
        schedule = this.scheduleRepository.create({
          doctor,
          day_of_week: scheduleDto.day_of_week,
          start_time: scheduleDto.start_time,
          end_time: scheduleDto.end_time,
          slot_duration: scheduleDto.slot_duration,
          is_active: scheduleDto.is_active,
        });

        await this.scheduleRepository.save(schedule);
      }

      results.push(schedule);
    }

    return results;
  }
}
