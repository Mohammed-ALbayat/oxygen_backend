import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { DoctorAppointmentDto } from './dto/doctor-appointment-list-item.dto';

@Injectable()
export class DoctorAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
  ) {}

  //   async getDoctorAppointments(doctorId: number) {}

  async getDoctorAppointments(
    doctorId: number,
  ): Promise<DoctorAppointmentDto[]> {
    const appointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.department', 'department')
      .where('appointment.doctor_id = :doctorId', {
        doctorId,
      })
      .orderBy('appointment.appointment_date', 'ASC')
      .addOrderBy('appointment.start_time', 'ASC')
      .getMany();

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
    return appointments.map((appointment) => {
      const appointmentDate =
        appointment.appointment_date instanceof Date
          ? appointment.appointment_date.toISOString().slice(0, 10)
          : String(appointment.appointment_date).slice(0, 10);

      return {
        id: appointment.id,

        patient_id: appointment.patient.id,
        patient_name: appointment.patient.user.full_name,

        department_id: appointment.department?.id ?? null,
        department_name: appointment.department?.title ?? null,

        appointment_date: appointmentDate,
        start_time: appointment.start_time,
        end_time: appointment.end_time,

        status: appointment.status,
        // payment_status: appointment.payment_status,

        cancellation_reason: appointment.cancellationReason?.reason ?? null,
      };
    });
  }
}

// //
// //بدي رجع مواعيد ال Active , waiting , start اما ال complete و cancelled فبدي رجعن آخر شي
//     appointments.sort((a, b) => {
//       const statusOrder = {
//         [AppointmentStatus.ACTIVE]: 1,
//         [AppointmentStatus.WAITING]: 2,
//         [AppointmentStatus.START]: 3,
//         [AppointmentStatus.COMPLETE]: 4,
//         [AppointmentStatus.CANCELLED]: 5,
//       };
//       return statusOrder[a.status] - statusOrder[b.status];
//     });
