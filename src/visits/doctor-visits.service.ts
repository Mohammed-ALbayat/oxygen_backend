import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Visit } from './entities/visit.entity';
import {
  Appointment,
  AppointmentStatus,
} from 'src/appointments/entities/appointment.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { VisitsService } from './visits.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class DoctorVisitsService {
  constructor(
    private visitService: VisitsService,

    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,

    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private readonly i18n: I18nService,
  ) {}

  async create(createVisitDto: CreateVisitDto) {
    const existing = await this.visitRepository.findOne({
      where: { appointment_id: createVisitDto.appointment_id },
    });
    if (existing) {
      throw new ConflictException(
        this.i18n.t('visits.VISIT_ALREADY_EXISTS'),
      );
    }
    const visit = this.visitRepository.create(createVisitDto);
    return this.visitRepository.save(visit);
  }

  async findAll(doctor_id: number) {
    const visits = await this.visitRepository.find({
      where: { appointment: { doctor: { user_id: doctor_id } } },
    });
    return visits;
  }

  async findOne(doctor_id: number, id: number) {
    const visit = this.findDoctorVisitById(id, doctor_id);

    return visit;
  }

  async patientVisits(doctor_id: number, patient_id: number) {
    const appointments = await this.appointmentRepository.find({
      where: {
        doctor: { user_id: doctor_id },
        patient: { userId: patient_id },
      },
      select: ['status'],
    });

    if (appointments.length === 0) {
      return [];
    }

    const hasActiveAppointment = appointments.some(
      (app) =>
        app.status === AppointmentStatus.START ||
        app.status === AppointmentStatus.WAITING,
    );

    if (hasActiveAppointment) {
      return await this.visitRepository.find({
        where: {
          appointment: {
            patient: { userId: patient_id },
          },
        },
        order: { created_at: 'DESC' },
      });
    }

    const doctor = await this.doctorRepository.findOne({
      where: { user_id: doctor_id },
    });
    const department_id = doctor?.specialty.id;

    return await this.visitRepository.find({
      where: {
        appointment: {
          department: { id: department_id },
          patient: { userId: patient_id },
        },
      },
      order: { created_at: 'DESC' },
    });
  }

  async update(doctor_id: number, id: number, updateVisitDto: UpdateVisitDto) {
    const visit = await this.findDoctorVisitById(id, doctor_id);

    Object.assign(visit, updateVisitDto);

    return await this.visitRepository.save(visit);
  }

  async remove(doctor_id: number, id: number) {
    const visit = await this.findDoctorVisitById(id, doctor_id);

    await this.visitRepository.remove(visit);

    return {
      message: this.i18n.t('visits.VISIT_DELETED', { args: { id } }),
    };
  }

  async findDoctorVisitById(visitId: number, doctor_id: number) {
    const visit = await this.visitRepository.findOne({
      where: { id: visitId, appointment: { doctor: { user_id: doctor_id } } },
    });

    if (!visit) {
      throw new NotFoundException(
        this.i18n.t('visits.VISIT_NOT_FOUND_DOCTOR'),
      );
    }

    return visit;
  }
}
