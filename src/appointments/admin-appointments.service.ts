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

@Injectable()
export class AdminAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
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
}
