import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { AdminAppointmentListItemDto } from './dto/admin-appointment-list-item.dto';
import { DepartmentDoctorsDto } from './dto/department-doctors.dto';
import { getDayEnum } from './doctor-schedule.utils';
import { generateTimeSlots } from './doctor-schedule.utils';
import { calculateEndTime } from './doctor-schedule.utils';
import { MessageDto } from 'src/common/dto/message.dto';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Doctor } from 'src/doctors/entities/doctor.entity';

@Injectable()
export class AdminAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async findAll(): Promise<AdminAppointmentListItemDto[]> {
    const appointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.department', 'department')
      .orderBy('appointment.appointment_date', 'DESC')
      .addOrderBy('appointment.start_time', 'DESC')
      .getMany();

    return appointments.map((appointment) => this.toListItem(appointment));
  }

  async cancel(id: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment cancelled successfully',
      data: appointment,
    };
  }

  private toListItem(appointment: Appointment): AdminAppointmentListItemDto {
    const appointmentDate =
      appointment.appointment_date instanceof Date
        ? appointment.appointment_date.toISOString().slice(0, 10)
        : String(appointment.appointment_date).slice(0, 10);

    return {
      id: appointment.id,
      department_id: appointment.department?.id ?? null,
      department_name: appointment.department?.title ?? null,
      appointment_date: appointmentDate,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      payment_status: appointment.payment_status,
      created_at: appointment.created_at,
      doctor_id: appointment.doctor.id,
      doctor_name: appointment.doctor.user.full_name,
      patient_id: appointment.patient.id,
      patient_name: appointment.patient.user.full_name,
      cancellation_reason_id: appointment.cancellation_reason_id,
    };
  }

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
      isBooked: bookedSlots.includes(slot),
    }));

    return {
      doctorId,
      date,
      day: dayEnum,
      slots,
    };
  }

  async adminBookAppointment(createDto: CreateAppointmentDto) {
    const { doctorId, patientId, date, start_time } = createDto;

    const targetDate = date;
    const dayEnum = getDayEnum(new Date(date));

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['specialty'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
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

    const patientConflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.patient_id = :patientId', { patientId })
      .andWhere('a.appointment_date = :date', { date: targetDate })
      .andWhere('a.start_time = :start_time', { start_time })
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

    return {
      message: 'Appointment booked successfully',
      appointment,
    };
  }
}
