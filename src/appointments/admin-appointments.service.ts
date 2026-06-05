import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { AdminAppointmentListItemDto } from './dto/admin-appointment-list-item.dto';
import { DepartmentDoctorsDto } from './dto/department-doctors.dto';

@Injectable()
export class AdminAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
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
}
