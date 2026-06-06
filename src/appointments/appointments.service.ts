import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { DepartmentDoctorsDto } from './dto/department-doctors.dto';
import { getDayEnum } from './doctor-schedule.utils';
import { generateTimeSlots } from './doctor-schedule.utils';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
  ) {}

  async getDepartmentsWithDoctors(): Promise<DepartmentDoctorsDto[]> {
    const specialties = await this.specialtyRepository
      .createQueryBuilder('specialty')
      .leftJoin('specialty.doctors', 'doctor')
      .leftJoin('doctor.user', 'user')
      .leftJoin('doctor.schedules', 'schedule')
      .addSelect([
        'specialty.id',
        'specialty.title',
        'doctor.id',
        'user.full_name',
        'schedule.day_of_week',
        'schedule.start_time',
        'schedule.end_time',
      ])
      .getMany();

    return specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.title,
      doctors: (specialty.doctors || []).map((doctor) => ({
        id: doctor.id,
        name: doctor.user?.full_name,
        schedules: (doctor.schedules || []).map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      })),
    }));
  }

  async getDoctorSlots(doctorId: number, date: string) {
    const targetDate = new Date(date);
    const dayEnum = getDayEnum(targetDate);

    const schedule = await this.scheduleRepository.findOne({
      where: {
        doctor: { id: doctorId },
        day_of_week: dayEnum,
        is_active: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(
        'No schedule found for this doctor on this day',
      );
    }

    const allSlots = generateTimeSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration,
    );

    const appointments = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctor_id = :doctorId', { doctorId })
      .andWhere('a.appointment_date = :date', { date })
      .getMany();

    const bookedSlots = appointments.map((a) => a.start_time.slice(0, 5));

    const slots = allSlots.map((slot) => ({
      time: slot,
      isBooked:
        bookedSlots.includes(slot) &&
        !appointments
          .find((a) => a.start_time.slice(0, 5) === slot)
          ?.status.includes(AppointmentStatus.CANCELLED),
    }));

    return {
      doctorId,
      date,
      day: dayEnum,
      slots,
    };
  }
}
