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
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

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

  async adminUpdateAppointment(
    appointmentId: number,
    dto: UpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled appointment');
    }

    if (dto.date) {
      const targetDate = new Date(dto.date);
      const today = new Date();
      if (targetDate < new Date(today.toDateString())) {
        throw new BadRequestException(
          'Cannot set appointment date in the past',
        );
      }
    }
    const newDoctorId = dto.doctorId ?? appointment.doctor.id;

    const newDate =
      dto.date ??
      (appointment.appointment_date instanceof Date
        ? appointment.appointment_date.toISOString().slice(0, 10)
        : String(appointment.appointment_date).slice(0, 10));

    const newStartTime = dto.start_time ?? appointment.start_time;

    const doctor = await this.doctorRepository.findOne({
      where: { id: newDoctorId },
      relations: ['specialty'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const dayEnum = getDayEnum(new Date(newDate));

    const schedule = await this.scheduleRepository.findOne({
      where: {
        doctor: { id: newDoctorId },
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

    if (!allSlots.includes(newStartTime)) {
      throw new BadRequestException('Invalid slot');
    }

    const conflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctor_id = :doctorId', {
        doctorId: newDoctorId,
      })
      .andWhere('a.appointment_date = :date', {
        date: newDate,
      })
      .andWhere('a.start_time = :startTime', {
        startTime: newStartTime,
      })
      .andWhere('a.id != :appointmentId', {
        appointmentId,
      })
      .getOne();

    if (conflict) {
      throw new BadRequestException('This slot is already booked');
    }

    appointment.doctor = doctor;
    appointment.department = doctor.specialty;
    appointment.appointment_date = new Date(newDate);
    appointment.start_time = newStartTime;
    appointment.end_time = calculateEndTime(
      newStartTime,
      schedule.slot_duration,
    );

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment updated successfully',
      appointment,
    };
  }

  async updateAppointmentStatus(id: number, status: AppointmentStatus) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

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
    id: number,
    paymentStatus: PaymentStatus,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

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
