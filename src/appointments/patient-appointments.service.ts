import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { PatientUpdateAppointmentDto } from './dto/patient-update-appointment.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { calculateEndTime, getDayEnum } from './doctor-schedule.utils';
import { generateTimeSlots } from './doctor-schedule.utils';

@Injectable()
export class PatientAppointmentsService {
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

  async patientUpdateAppointment(
    patientId: number,
    appointmentId: number,
    dto: PatientUpdateAppointmentDto,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        patient: {
          id: patientId,
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
        doctor: { id: doctor.id },
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
        doctorId: doctor.id,
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
}
