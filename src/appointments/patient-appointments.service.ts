import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientUpdateAppointmentDto } from './dto/patient-update-appointment.dto';
import { CancelAppointmentDto } from './dto/patient-cancellation.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { PatientCreateAppointmentDto } from './dto/patient-create-appointment.dto';
import { PusherService } from '../pusher/pusher.service';

@Injectable()
export class PatientAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    private appointmentService: AppointmentsService,
    private pusherService: PusherService,
  ) {}

  async findAllAppointment(
    patientId: number,
    appointment_status: AppointmentStatus | undefined,
  ) {
    const whereConditions: any = {
      patient: { userId: patientId },
    };

    if (appointment_status) {
      whereConditions.status = appointment_status;
    }

    const appointments = await this.appointmentRepository.find({
      where: whereConditions,
    });

    return appointments;
  }

  async createAppointment(patientId: number, dto: PatientCreateAppointmentDto) {
    const appointment = await this.appointmentService.createAppointment(
      dto.doctorId,
      patientId,
      dto.date,
      dto.start_time,
    );

    await this.pusherService.triggerEvent(
      'secretary-channel',
      'new-appointment',
      appointment,
    );

    return appointment;
  }

  async patientUpdateAppointment(
    patientId: number,
    appointmentId: number,
    dto: PatientUpdateAppointmentDto,
  ) {
    const appointment =
      await this.appointmentService.findAppointmentById(appointmentId);

    if (appointment.patient.userId !== patientId) {
      throw new BadRequestException('Appointment belong to another patient');
    }

    if (appointment.is_updated_by_patient) {
      throw new BadRequestException(
        'You can only reschedule an appointment once',
      );
    }

    return this.appointmentService.updateAppointment(
      appointment,
      dto.date,
      dto.start_time,
    );
  }

  async patientCancelAppointment(
    patientId: number,
    appointmentId: number,
    dto: CancelAppointmentDto,
  ) {
    const appointment =
      await this.appointmentService.findAppointmentById(appointmentId);

    if (appointment.patient.userId !== patientId) {
      throw new BadRequestException('Appointment belong to another patient');
    }

    return this.appointmentService.cancelAppointment(appointment, dto.reason);
  }

  async getDepartmentsWithDoctors(specialtyId: number | undefined) {
    return this.appointmentService.getDepartmentsWithDoctors(specialtyId);
  }
}
