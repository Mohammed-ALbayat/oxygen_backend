import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientUpdateAppointmentDto } from './dto/patient-update-appointment.dto';
import { CancelAppointmentDto } from './dto/patient-cancellation.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { AppointmentReview } from './entities/appointment-review.entity';
import { AppointmentsService } from './appointments.service';
import { PatientCreateAppointmentDto } from './dto/patient-create-appointment.dto';
import { CreateAppointmentReviewDto } from './dto/create-appointment-review.dto';
import { toReviewDto } from './utils/to-review-dto';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { PusherService } from '../pusher/pusher.service';
import { CancellationReasonsService } from 'src/cancellation-reasons/cancellation-reasons.service';
import { toStorageUrl } from 'src/storage/utils/storage-url.util';

@Injectable()
export class PatientAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentReview)
    private reviewRepository: Repository<AppointmentReview>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,

    private appointmentService: AppointmentsService,
    private pusherService: PusherService,
    private cancellationReasonsService: CancellationReasonsService,
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
      relations: { doctor: { user: true } },
    });

    return appointments.map((appointment) => ({
      ...appointment,
      doctor: {
        id: appointment.doctor.user_id,
        name: appointment.doctor.user.full_name,
        image_path: toStorageUrl(appointment.doctor.user.image_path),
      },
    }));
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

    const reason = await this.cancellationReasonsService.findActiveOne(
      dto.reasonId,
    );

    return this.appointmentService.cancelAppointment(appointment, reason);
  }

  async getDepartmentsWithDoctors(specialtyId: number | undefined) {
    return this.appointmentService.getDepartmentsWithDoctors(specialtyId);
  }

  async createReview(
    patientId: number,
    appointmentId: number,
    dto: CreateAppointmentReviewDto,
  ) {
    const appointment = await this.findOwnedAppointment(
      patientId,
      appointmentId,
    );

    if (appointment.status !== AppointmentStatus.COMPLETE) {
      throw new BadRequestException(
        'Only completed appointments can be reviewed',
      );
    }

    const existing = await this.reviewRepository.findOne({
      where: { appointment: { id: appointmentId } },
    });

    if (existing) {
      throw new ConflictException('This appointment has already been reviewed');
    }

    const review = this.reviewRepository.create({
      appointment,
      score: dto.score,
      comment: dto.comment ?? null,
    });

    await this.reviewRepository.save(review);
    await this.recalculateDoctorRating(appointment.doctor.user_id);

    return toReviewDto(review, appointmentId);
  }

  async getReview(patientId: number, appointmentId: number) {
    await this.findOwnedAppointment(patientId, appointmentId);

    const review = await this.reviewRepository.findOne({
      where: { appointment: { id: appointmentId } },
    });

    if (!review) {
      throw new NotFoundException('This appointment has not been reviewed yet');
    }

    return toReviewDto(review, appointmentId);
  }

  private async findOwnedAppointment(patientId: number, appointmentId: number) {
    const appointment =
      await this.appointmentService.findAppointmentById(appointmentId);

    if (appointment.patient.userId !== patientId) {
      throw new BadRequestException('Appointment belong to another patient');
    }

    return appointment;
  }

  /**
   * Refreshes the cached all-time rating on the doctor profile from the reviews
   * left on their appointments.
   */
  private async recalculateDoctorRating(doctorId: number) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.appointment', 'appointment')
      .select('AVG(review.score)', 'average')
      .where('appointment.doctor_id = :doctorId', { doctorId })
      .getRawOne<{ average: string | null }>();

    await this.doctorRepository.update(doctorId, {
      average_rating: Number(result?.average ?? 0),
    });
  }
}
