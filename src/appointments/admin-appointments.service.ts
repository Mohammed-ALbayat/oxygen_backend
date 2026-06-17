import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from './entities/appointment.entity';
import { AdminAppointmentListItemDto } from './dto/admin-appointment-list-item.dto';
import { UpdateAppointmentDto } from './dto/admin-update-appointment.dto';
import { AppointmentsService } from './appointments.service';
import { toListItem } from './utils/to-list-item';

@Injectable()
export class AdminAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    private appointmentsService: AppointmentsService,
  ) {}

  async findAll(
    status: AppointmentStatus | undefined,
  ): Promise<AdminAppointmentListItemDto[]> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.department', 'department')
      .orderBy('appointment.appointment_date', 'DESC')
      .addOrderBy('appointment.start_time', 'DESC');

    if (status) {
      query.andWhere('appointment.status  = :status', { status });
    }
    const appointments = await query.getMany();

    return appointments.map((appointment) => toListItem(appointment));
  }

  async cancel(appointment_id: number, reason: string) {
    const appointment =
      await this.appointmentsService.findAppointmentById(appointment_id);

    return this.appointmentsService.cancelAppointment(appointment, reason);
  }

  async adminUpdateAppointment(
    appointment_id: number,
    dto: UpdateAppointmentDto,
  ) {
    const appointment =
      await this.appointmentsService.findAppointmentById(appointment_id);

    return this.appointmentsService.updateAppointment(
      appointment,
      dto.date,
      dto.start_time,
    );
  }

  async updateAppointmentStatus(
    appointment_id: number,
    status: AppointmentStatus,
  ) {
    const appointment =
      await this.appointmentsService.findAppointmentById(appointment_id);

    if (!Object.values(AppointmentStatus).includes(status)) {
      throw new BadRequestException('Invalid appointment status');
    }

    appointment.status = status;
    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment status updated successfully',
      appointment,
    };
  }

  async updateAppointmentPaymentStatus(
    appointment_id: number,
    paymentStatus: PaymentStatus,
  ) {
    const appointment =
      await this.appointmentsService.findAppointmentById(appointment_id);

    if (!Object.values(PaymentStatus).includes(paymentStatus)) {
      throw new BadRequestException('Invalid payment status');
    }

    appointment.payment_status = paymentStatus;
    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment payment status updated successfully',
      appointment,
    };
  }
}
