import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { DoctorAppointmentDto } from './dto/doctor-appointment-list-item.dto';

@Injectable()
export class DoctorAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getDoctorAppointments(
    doctorId: number,
    status?: AppointmentStatus,
  ): Promise<DoctorAppointmentDto[]> {
    if (status && !Object.values(AppointmentStatus).includes(status)) {
      throw new BadRequestException('Invalid appointment status');
    }
    const appointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.department', 'department')
      .where('appointment.doctor_id = :doctorId', {
        doctorId,
      })
      .andWhere(status ? 'appointment.status = :status' : '1=1', {
        status,
      })
      .orderBy('appointment.appointment_date', 'ASC')
      .addOrderBy('appointment.start_time', 'ASC')
      .getMany();

    if (!status) {
      appointments.sort((a, b) => {
        const statusOrder = {
          [AppointmentStatus.START]: 1,
          [AppointmentStatus.WAITING]: 2,
          [AppointmentStatus.ACTIVE]: 3,
          [AppointmentStatus.PENDING]: 4,
          [AppointmentStatus.COMPLETE]: 5,
          [AppointmentStatus.CANCELLED]: 6,
        };

        return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
      });
    }

    return appointments.map((appointment) => {
      const appointmentDate =
        appointment.appointment_date instanceof Date
          ? appointment.appointment_date.toISOString().slice(0, 10)
          : String(appointment.appointment_date).slice(0, 10);

      return {
        id: appointment.id,

        patient_id: appointment.patient.userId,
        patient_name: appointment.patient.user.full_name,

        department_id: appointment.department?.id ?? null,
        department_name: appointment.department?.title ?? null,

        appointment_date: appointmentDate,
        start_time: appointment.start_time,
        end_time: appointment.end_time,

        status: appointment.status,

        cancellation_reason: appointment.cancellation_reason ?? null,
      };
    });
  }
}
