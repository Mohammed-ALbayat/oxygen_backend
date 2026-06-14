import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PatientUpdateAppointmentDto } from './dto/patient-update-appointment.dto';
import { CancelAppointmentDto } from './dto/patient-cancellation.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { calculateEndTime, getDayEnum } from './utils/doctor-schedule.utils';
import { generateTimeSlots } from './utils/doctor-schedule.utils';
import { AppointmentsService } from './appointments.service';
import { PatientCreateAppointmentDto } from './dto/patient-create-appointment.dto';
import { Specialty } from 'src/specialty/entities/specialty.entity';

@Injectable()
export class PatientAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,

    private appointmentService: AppointmentsService,
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
    return this.appointmentService.createAppointment(
      dto.doctorId,
      patientId,
      dto.date,
      dto.start_time,
    );
  }

  async patientUpdateAppointment(
    patientId: number,
    appointmentId: number,
    dto: PatientUpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        patient: {
          userId: patientId,
        },
      },
      relations: ['doctor', 'patient', 'department'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled appointment');
    }

    if (
      appointment.status === AppointmentStatus.START ||
      appointment.status === AppointmentStatus.COMPLETE
    ) {
      throw new BadRequestException(
        'This appointment can no longer be modified',
      );
    }

    if (appointment.is_updated_by_patient) {
      throw new BadRequestException(
        'You can only reschedule an appointment once',
      );
    }

    const newDate =
      dto.date ??
      (appointment.appointment_date instanceof Date
        ? appointment.appointment_date.toISOString().slice(0, 10)
        : String(appointment.appointment_date).slice(0, 10));

    const newStartTime = dto.start_time ?? appointment.start_time;

    const targetDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      throw new BadRequestException('Cannot set appointment date in the past');
    }

    // منع التعديل قبل أقل من 24 ساعة من الموعد الحالي
    const originalAppointmentDateTime = new Date(
      `${appointment.appointment_date}T${appointment.start_time}`,
    );

    const now = new Date();

    const hoursDifference =
      (originalAppointmentDateTime.getTime() - now.getTime()) /
      (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new BadRequestException(
        'Appointments cannot be modified within 24 hours',
      );
    }

    const doctor = appointment.doctor;

    const dayEnum = getDayEnum(targetDate);

    const schedule = await this.scheduleRepository.findOne({
      where: {
        doctor: { user_id: doctor.user_id },
        day_of_week: dayEnum,
        is_active: true,
      },
    });

    if (!schedule) {
      throw new BadRequestException('Doctor not available on this day');
    }

    if (schedule.slot_duration <= 0) {
      throw new BadRequestException(
        'Doctor schedule is configured incorrectly',
      );
    }

    const allSlots = generateTimeSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration,
    );

    if (!allSlots.includes(newStartTime)) {
      throw new BadRequestException('Selected time is outside doctor schedule');
    }

    // التحقق من تعارض مع مواعيد الطبيب
    const doctorConflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctor_id = :doctorId', {
        doctorId: doctor.user_id,
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
      .andWhere('a.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      })
      .getOne();

    if (doctorConflict) {
      throw new BadRequestException('This slot is already booked');
    }

    // التحقق من تعارض مع مواعيد المريض
    const patientConflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.patient_id = :patientId', {
        patientId,
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
      .andWhere('a.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      })
      .getOne();

    if (patientConflict) {
      throw new BadRequestException(
        'You already have another appointment at this time',
      );
    }

    appointment.appointment_date = targetDate;
    appointment.start_time = newStartTime;
    appointment.end_time = calculateEndTime(
      newStartTime,
      schedule.slot_duration,
    );

    appointment.is_updated_by_patient = true;

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment rescheduled successfully',
      appointment,
    };
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

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment already cancelled');
    }

    if (
      appointment.status === AppointmentStatus.START ||
      appointment.status === AppointmentStatus.COMPLETE
    ) {
      throw new BadRequestException('Cannot cancel this appointment');
    }

    appointment.cancellation_reason = dto.reason;
    appointment.status = AppointmentStatus.CANCELLED;

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment cancelled successfully',
      appointment,
    };
  }

  async getDepartmentsWithDoctors(specialtyId: number | undefined) {
    return this.appointmentService.getDepartmentsWithDoctors(specialtyId);
  }
}
