import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  DEPOSIT_AMOUNT,
  PaymentStatus,
} from './entities/appointment.entity';
import { AdminCreateAppointmentDto } from './dto/admin-create-appointment.dto';
import { UpdateAppointmentDto } from './dto/admin-update-appointment.dto';
import { AppointmentsService } from './appointments.service';
import { toListItem } from './utils/to-list-item';
import { PusherService } from 'src/pusher/pusher.service';
import { AppointmentWaitingTimeService } from './appointment-waiting-time.service';
import { CancellationReasonsService } from 'src/cancellation-reasons/cancellation-reasons.service';
import { Patient } from 'src/patients/entities/patient.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AdminAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private appointmentsService: AppointmentsService,
    private pusherService: PusherService,
    private appointmentWaitingTimeService: AppointmentWaitingTimeService,
    private cancellationReasonsService: CancellationReasonsService,
    private readonly i18n: I18nService,
  ) {}

  getDoctorSlots(doctorId: number, date?: string) {
    return this.appointmentsService.getDoctorSlots(doctorId, date);
  }

  async createAppointment(dto: AdminCreateAppointmentDto) {
    const patient = await this.patientRepository.findOne({
      where: { userId: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        this.i18n.t('appointments.PATIENT_NOT_FOUND'),
      );
    }

    const appointment = await this.appointmentsService.createAppointment(
      dto.doctorId,
      dto.patientId,
      dto.date,
      dto.start_time,
      { allowPastDate: true },
    );

    await this.pusherService.triggerEvent(
      'secretary-channel',
      'new-appointment',
      appointment,
    );

    return appointment;
  }

  async findAll(
    page: number,
    limit: number,
    status: AppointmentStatus | undefined,
    patientId?: number,
  ) {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.visit', 'visit')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.department', 'department')
      .orderBy('appointment.appointment_date', 'DESC')
      .addOrderBy('appointment.start_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.andWhere('appointment.status  = :status', { status });
    }

    if (patientId) {
      query.andWhere('appointment.patient_id = :patientId', { patientId });
    }

    const [appointments, total] = await query.getManyAndCount();

    return {
      data: appointments.map((appointment) => toListItem(appointment)),
      total,
      currentPage: page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async cancel(appointment_id: number, reason: string, reasonId?: number) {
    const appointment =
      await this.appointmentsService.findAppointmentById(appointment_id);

    const resolvedReason = reasonId
      ? await this.cancellationReasonsService.findOne(reasonId)
      : reason;

    return this.appointmentsService.cancelAppointment(
      appointment,
      resolvedReason,
    );
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
      { bypassTimeConstraints: true },
    );
  }

  async updateAppointmentStatus(
    appointment_id: number,
    status: AppointmentStatus,
  ) {
    const appointment =
      await this.appointmentsService.findAppointmentById(appointment_id);

    if (!Object.values(AppointmentStatus).includes(status)) {
      throw new BadRequestException(
        this.i18n.t('appointments.INVALID_STATUS'),
      );
    }

    this.appointmentWaitingTimeService.applyTransition(
      appointment,
      appointment.status,
      status,
    );

    appointment.status = status;
    await this.appointmentRepository.save(appointment);

    const normalizeAppointment = toListItem(appointment);
    if (
      [AppointmentStatus.WAITING, AppointmentStatus.START].includes(
        normalizeAppointment.status,
      )
    ) {
      await this.pusherService.triggerEvent('queue', 'appointment-updated', {
        normalizeAppointment,
      });
    }

    return {
      message: this.i18n.t('appointments.STATUS_UPDATED_SUCCESS'),
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
      throw new BadRequestException(
        this.i18n.t('appointments.INVALID_PAYMENT_STATUS'),
      );
    }

    appointment.payment_status = paymentStatus;
    appointment.collected_amount = this.resolveCollectedAmount(
      appointment,
      paymentStatus,
    );
    await this.appointmentRepository.save(appointment);

    return {
      message: this.i18n.t('appointments.PAYMENT_STATUS_UPDATED_SUCCESS'),
      appointment,
    };
  }

  /**
   * Records how much money the clinic actually holds for this appointment so the
   * revenue report does not have to guess. Refunds keep the previous amount so
   * the report can subtract it.
   */
  private resolveCollectedAmount(
    appointment: Appointment,
    paymentStatus: PaymentStatus,
  ): number | null {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return Number(appointment.doctor?.examination_price ?? 0);
      case PaymentStatus.DEPOSIT_PAID:
        return Number(appointment.deposit_amount ?? DEPOSIT_AMOUNT);
      case PaymentStatus.REFUNDED:
        return appointment.collected_amount;
      default:
        return null;
    }
  }
}
