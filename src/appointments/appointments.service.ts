import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { DepartmentDoctorsDto } from './dto/department-doctors.dto';
import { calculateEndTime, getDayEnum } from './doctor-schedule.utils';
import { generateTimeSlots } from './doctor-schedule.utils';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Patient } from 'src/patients/entities/patient.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly eventEmitter: EventEmitter2,
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

  async createAppointment(createDto: CreateAppointmentDto) {
    const { doctorId, patientId, date, start_time } = createDto;

    const targetDate = date;
    const dayEnum = getDayEnum(new Date(date));

    const today = new Date();
    if (new Date(targetDate) < new Date(today.toDateString())) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['specialty', 'user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('patient not found');
    }

    const schedule = await this.scheduleRepository.findOne({
      where: {
        doctor: { id: doctorId },
        day_of_week: dayEnum,
        is_active: true,
      },
    });

    if (!schedule) {
      throw new BadRequestException('Doctor not available on this day');
    }

    const allSlots = generateTimeSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration,
    );

    if (!allSlots.includes(start_time)) {
      throw new BadRequestException('Invalid time slot');
    }

    // التحقق من وجود تعارض في مواعيد المريض والطبيب بدون اعتبار المواعيد الملغاة

    const patientConflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.patient_id = :patientId', { patientId })
      .andWhere('a.appointment_date = :date', { date: targetDate })
      .andWhere('a.start_time = :start_time', { start_time })
      .andWhere('a.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      })
      .getOne();

    if (patientConflict) {
      throw new BadRequestException(
        'Patient already has an appointment at this time',
      );
    }

    const doctorConflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctor_id = :doctorId', { doctorId })
      .andWhere('a.appointment_date = :date', { date: targetDate })
      .andWhere('a.start_time = :start_time', { start_time })
      .andWhere('a.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      })
      .getOne();

    if (doctorConflict) {
      throw new BadRequestException('This slot is already booked');
    }

    const appointment = this.appointmentRepository.create({
      doctor: { id: doctorId },
      patient: { id: patientId },
      department: doctor.specialty,
      appointment_date: targetDate,
      start_time,
      end_time: calculateEndTime(start_time, schedule.slot_duration),
      status: AppointmentStatus.PENDING,
      payment_status: PaymentStatus.UNPAID,
    });

    await this.appointmentRepository.save(appointment);
    this.eventEmitter.emit('appointment.created', {
      patientUserId: patient.user.id,
      doctorUserId: doctor.user.id,
      date: targetDate,
      time: start_time,
    });
    return {
      message: 'Appointment booked successfully',
      appointment,
    };
  }
}
