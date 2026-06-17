import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { calculateEndTime, getDayEnum } from './utils/doctor-schedule.utils';
import { generateTimeSlots } from './utils/doctor-schedule.utils';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import {
  formatLocalDate,
  extractDateString,
  generateTargetDates,
} from './utils/date.helper';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
  ) {}

  async getDoctorSlots(doctorId: number, date?: string) {
    const isSingleDate = !!date;

    const targetDates = generateTargetDates(date);
    const startDate = formatLocalDate(targetDates[0]);
    const endDate = formatLocalDate(targetDates[targetDates.length - 1]);

    const schedules = await this.scheduleRepository.find({
      where: { doctor: { user_id: doctorId }, is_active: true },
    });

    if (isSingleDate && schedules.length === 0) {
      throw new NotFoundException('No schedule found for this doctor');
    }

    const appointments = await this.fetchAppointmentsWithinRange(
      doctorId,
      startDate,
      endDate,
      isSingleDate,
    );

    const availableDays = this.calculateAvailableDays(
      targetDates,
      schedules,
      appointments,
      isSingleDate,
    );

    return {
      doctorId,
      availableDays,
    };
  }

  async createAppointment(
    doctorId: number,
    patientId: number,
    date: string,
    start_time: string,
  ) {
    const targetDate = date;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(targetDate) < today) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    const doctor = await this.doctorRepository.findOne({
      where: { user_id: doctorId },
      relations: ['specialty'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const schedule = await this.verifyDoctorSchedule(
      doctorId,
      targetDate,
      start_time,
    );

    await this.ensureNoConflicts(
      doctorId,
      patientId,
      targetDate,
      start_time,
      0,
    );

    const appointment = this.appointmentRepository.create({
      doctor: { user_id: doctorId },
      patient: { userId: patientId },
      department: doctor.specialty,
      appointment_date: targetDate,
      start_time,
      end_time: calculateEndTime(start_time, schedule.slot_duration),
      status: AppointmentStatus.PENDING,
      payment_status: PaymentStatus.UNPAID,
    });

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment booked successfully',
      appointment,
    };
  }

  async findAppointmentById(appointmentId: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'doctor', 'department'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async getDepartmentsWithDoctors(specialtyId: number | undefined) {
    const query = this.specialtyRepository
      .createQueryBuilder('specialty')
      .leftJoin('specialty.doctors', 'doctor')
      .leftJoin('doctor.user', 'user')
      .leftJoin('doctor.schedules', 'schedule')
      .addSelect([
        'specialty.id',
        'specialty.title',
        'doctor.user_id',
        'user.full_name',
        'schedule.day_of_week',
        'schedule.start_time',
        'schedule.end_time',
      ]);

    if (specialtyId) {
      query.andWhere('specialty.id = :specialtyId', { specialtyId });
    }

    const specialties = await query.getMany();

    return specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.title,
      doctors: (specialty.doctors || []).map((doctor) => ({
        id: doctor.user_id,
        name: doctor.user?.full_name,
        schedules: (doctor.schedules || []).map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      })),
    }));
  }

  async updateAppointment(
    appointment: Appointment,
    date: string | undefined,
    start_time: string | undefined,
  ) {
    this.checkAppointmentEligibility(appointment);

    const newDate = date ?? extractDateString(appointment.appointment_date);
    const newStartTime = start_time ?? appointment.start_time;

    this.validateTimeConstraints(appointment, newDate);

    const schedule = await this.verifyDoctorSchedule(
      appointment.doctor.user_id,
      newDate,
      newStartTime,
    );

    await this.ensureNoConflicts(
      appointment.doctor.user_id,
      appointment.patient.userId,
      newDate,
      newStartTime,
      appointment.id,
    );

    appointment.appointment_date = new Date(newDate);
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

  async cancelAppointment(appointment: Appointment, reason: string) {
    this.checkAppointmentEligibility(appointment);

    appointment.cancellation_reason = reason;
    appointment.status = AppointmentStatus.CANCELLED;

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment cancelled successfully',
      appointment,
    };
  }

  /**
   * Validates whether the current status of the appointment allows it to be rescheduled.
   */
  private checkAppointmentEligibility(appointment: Appointment) {
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled appointment');
    }
    if (
      [AppointmentStatus.START, AppointmentStatus.COMPLETE].includes(
        appointment.status,
      )
    ) {
      throw new BadRequestException(
        'This appointment can no longer be modified',
      );
    }
  }

  /**
   * Ensures the new appointment date is not in the past and complies with the minimum 24-hour notice policy for modifications.
   */
  private validateTimeConstraints(
    appointment: Appointment,
    targetDateString: string,
  ) {
    const targetDate = new Date(targetDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      throw new BadRequestException('Cannot set appointment date in the past');
    }

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
  }

  /**
   * Confirms that the doctor has an active schedule on the requested day and that the selected time falls within their valid working hours.
   */
  private async verifyDoctorSchedule(
    doctorId: number,
    targetDateString: string,
    requestedTime: string,
  ) {
    const targetDate = new Date(targetDateString);
    const dayEnum = getDayEnum(targetDate);

    const schedule = await this.scheduleRepository.findOne({
      where: {
        doctor: { user_id: doctorId },
        day_of_week: dayEnum,
        is_active: true,
      },
    });

    if (!schedule)
      throw new BadRequestException('Doctor not available on this day');
    if (schedule.slot_duration <= 0)
      throw new BadRequestException(
        'Doctor schedule is configured incorrectly',
      );

    const allSlots = generateTimeSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration,
    );
    if (!allSlots.includes(requestedTime)) {
      throw new BadRequestException('Selected time is outside doctor schedule');
    }

    return schedule;
  }

  /**
   * Checks for any scheduling overlaps to ensure that neither the doctor nor the patient has another active appointment at the requested time.
   */
  private async ensureNoConflicts(
    doctorId: number,
    patientId: number,
    date: string,
    startTime: string,
    currentAppointmentId: number,
  ) {
    const [doctorConflict, patientConflict] = await Promise.all([
      this.appointmentRepository.findOne({
        where: {
          doctor: { user_id: doctorId },
          appointment_date: new Date(date),
          start_time: startTime,
          id: Not(currentAppointmentId),
          status: Not(AppointmentStatus.CANCELLED),
        },
      }),
      this.appointmentRepository.findOne({
        where: {
          patient: { userId: patientId },
          appointment_date: new Date(date),
          start_time: startTime,
          id: Not(currentAppointmentId),
          status: Not(AppointmentStatus.CANCELLED),
        },
      }),
    ]);

    if (doctorConflict)
      throw new BadRequestException('This slot is already booked');
    if (patientConflict)
      throw new BadRequestException(
        'You already have another appointment at this time',
      );
  }

  /**
   * Fetches all booked appointments for a specific doctor within a given date range.
   */
  private async fetchAppointmentsWithinRange(
    doctorId: number,
    startDate: string,
    endDate: string,
    isSingleDate: boolean,
  ) {
    const query = this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctor_id = :doctorId', { doctorId });

    if (isSingleDate) {
      query.andWhere('a.appointment_date = :startDate', { startDate });
    } else {
      query
        .andWhere('a.appointment_date >= :startDate', { startDate })
        .andWhere('a.appointment_date <= :endDate', { endDate });
    }

    return await query.getMany();
  }

  /**
   * Intersects the doctor's schedules with booked appointments to extract available time slots for each requested day.
   */
  private calculateAvailableDays(
    targetDates: Date[],
    schedules: any[],
    appointments: any[],
    isSingleDate: boolean,
  ) {
    const availableDays: any = [];

    for (const currentDate of targetDates) {
      const dateString = formatLocalDate(currentDate);
      const dayEnum = getDayEnum(currentDate);

      const schedule = schedules.find((s) => s.day_of_week === dayEnum);

      if (!schedule) {
        if (isSingleDate) {
          throw new NotFoundException(
            'No schedule found for this doctor on this day',
          );
        }
        continue;
      }

      const allSlots = generateTimeSlots(
        schedule.start_time,
        schedule.end_time,
        schedule.slot_duration,
      );

      const dayAppointments = appointments.filter((a) => {
        const appDate = formatLocalDate(new Date(a.appointment_date));
        return appDate === dateString;
      });

      const bookedSlots = dayAppointments.map((a) => a.start_time.slice(0, 5));

      const slots = allSlots.map((slot) => ({
        time: slot,
        isBooked:
          bookedSlots.includes(slot) &&
          !dayAppointments
            .find((a) => a.start_time.slice(0, 5) === slot)
            ?.status.includes(AppointmentStatus.CANCELLED),
      }));

      availableDays.push({
        date: dateString,
        day: dayEnum,
        slots,
      });
    }

    return availableDays;
  }
}
