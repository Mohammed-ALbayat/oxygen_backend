import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { DataSource, Repository } from 'typeorm';

import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';
import { AppointmentReview } from 'src/appointments/entities/appointment-review.entity';
import { CancellationReason } from 'src/cancellation-reasons/entities/cancellation-reason.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { User } from 'src/users/entities/user.entity';
import { Gender } from 'src/users/enums/gender.enum';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Visit } from 'src/visits/entities/visit.entity';

import {
  ADMIN_PASSWORD,
  ADMIN_PHONE,
  ALLERGIES,
  BATCH_SIZE,
  CANCELLATION_REASONS,
  CHRONIC_DISEASES,
  DOCTOR_PASSWORD,
  PERMANENT_MEDICATIONS,
  PREVIOUS_OPERATIONS,
  SECRETARY_PASSWORD,
  SPECIALTY_TITLES,
  largeSeedConfig,
  LARGE_SEED_DEPOSIT_AMOUNT,
  EXAMINATION_PRICE_MIN,
  EXAMINATION_PRICE_MAX,
} from './helpers/large-seed.config';
import {
  appointmentSlot,
  bloodType,
  buildStatusPlan,
  chunk,
  clinicalNote,
  doctorBio,
  doctorPhone,
  doctorSpecialization,
  doctorWorkingDays,
  fullName,
  futureWorkingDate,
  pastWorkingDate,
  patientAddress,
  patientPhone,
  paymentStatusFor,
  reviewComment,
  reviewScore,
  secretaryPhone,
  toDateOnly,
  today,
  waitingDurationSeconds,
} from './helpers/large-seed.factory';

/** Share of completed appointments that get a clinical record and a review. */
const VISIT_RATE = 0.8;
const REVIEW_RATE = 0.7;
const COMPLETED_WITH_MEASURED_WAIT_RATE = 0.6;

@Injectable()
export class LargeSeederService {
  private readonly logger = new Logger(LargeSeederService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
    @InjectRepository(CancellationReason)
    private readonly cancellationReasonRepository: Repository<CancellationReason>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Secretary)
    private readonly secretaryRepository: Repository<Secretary>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(AppointmentReview)
    private readonly reviewRepository: Repository<AppointmentReview>,
  ) {}

  async run(): Promise<void> {
    const startedAt = Date.now();
    this.logger.log('Large data seeding started');

    const admin = await this.seedAdmin();
    const specialties = await this.seedSpecialties();
    const reasons = await this.seedCancellationReasons();
    const doctors = await this.seedDoctors(specialties);
    await this.seedSecretaries();
    const patients = await this.seedPatients();
    await this.seedAppointments(admin, doctors, patients, reasons);
    await this.alignTimestamps();
    await this.refreshDoctorRatings(doctors);

    this.logger.log(
      `Large data seeding finished in ${Math.round((Date.now() - startedAt) / 1000)}s`,
    );
    this.logCredentials();
  }

  private async seedAdmin(): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { phone: ADMIN_PHONE },
    });

    if (existing) {
      this.logger.log('Admin already present, reusing it');
      return existing;
    }

    const admin = await this.userRepository.save(
      this.userRepository.create({
        full_name: fullName(Gender.MALE),
        phone: ADMIN_PHONE,
        password: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: UserRole.ADMIN,
        gender: Gender.MALE,
      }),
    );

    this.logger.log('Admin seeded');

    return admin;
  }

  private async seedSpecialties(): Promise<Specialty[]> {
    const titles = SPECIALTY_TITLES.slice(0, largeSeedConfig.specialties);

    await this.specialtyRepository.save(
      titles.map((title) => ({ title, published: true })),
    );

    const specialties = await this.specialtyRepository.find();
    this.logger.log(`${specialties.length} specialties seeded`);

    return specialties;
  }

  private async seedCancellationReasons(): Promise<CancellationReason[]> {
    await this.cancellationReasonRepository.save(
      CANCELLATION_REASONS.map((label) => ({ label })),
    );

    const reasons = await this.cancellationReasonRepository.find();
    this.logger.log(`${reasons.length} cancellation reasons seeded`);

    return reasons;
  }

  private async seedDoctors(specialties: Specialty[]): Promise<Doctor[]> {
    const password = await bcrypt.hash(DOCTOR_PASSWORD, 10);
    const doctors: Doctor[] = [];
    const schedules: DoctorSchedule[] = [];

    for (let i = 1; i <= largeSeedConfig.doctors; i++) {
      const gender = i % 3 === 0 ? Gender.FEMALE : Gender.MALE;
      const name = fullName(gender);
      const specialty = specialties[(i - 1) % specialties.length];

      const user = await this.userRepository.save(
        this.userRepository.create({
          full_name: name,
          phone: doctorPhone(i),
          password,
          role: UserRole.DOCTOR,
          gender,
          birth_date: faker.date.birthdate({ min: 30, max: 65, mode: 'age' }),
        }),
      );

      const doctor = await this.doctorRepository.save(
        this.doctorRepository.create({
          user_id: user.id,
          user,
          specialty,
          specialization: doctorSpecialization(specialty.title),
          bio: doctorBio(name, specialty.title),
          examination_price: faker.number.int({
            min: EXAMINATION_PRICE_MIN,
            max: EXAMINATION_PRICE_MAX,
          }),
          doctor_percentage: faker.helpers.arrayElement([10, 12, 15, 20]),
          average_rating: 0,
        }),
      );

      doctors.push(doctor);

      for (const day of doctorWorkingDays()) {
        schedules.push(
          this.doctorScheduleRepository.create({
            doctor,
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            slot_duration: 30,
          }),
        );
      }
    }

    await this.doctorScheduleRepository.save(schedules);
    this.logger.log(
      `${doctors.length} doctors seeded with ${schedules.length} weekly schedules`,
    );

    return doctors;
  }

  private async seedSecretaries(): Promise<void> {
    const password = await bcrypt.hash(SECRETARY_PASSWORD, 10);
    const shifts = [
      { shift_start: '08:00:00', shift_end: '16:00:00' },
      { shift_start: '09:00:00', shift_end: '17:00:00' },
      { shift_start: '10:00:00', shift_end: '18:00:00' },
      { shift_start: '12:00:00', shift_end: '20:00:00' },
    ];

    for (let i = 1; i <= largeSeedConfig.secretaries; i++) {
      const gender = i % 2 === 0 ? Gender.MALE : Gender.FEMALE;

      const user = await this.userRepository.save(
        this.userRepository.create({
          full_name: fullName(gender),
          phone: secretaryPhone(i),
          password,
          role: UserRole.SECRETARY,
          gender,
          birth_date: faker.date.birthdate({ min: 22, max: 45, mode: 'age' }),
        }),
      );

      await this.secretaryRepository.save(
        this.secretaryRepository.create({
          user_id: user.id,
          user,
          ...shifts[(i - 1) % shifts.length],
        }),
      );
    }

    this.logger.log(`${largeSeedConfig.secretaries} secretaries seeded`);
  }

  private async seedPatients(): Promise<Patient[]> {
    const users: User[] = [];

    for (let i = 1; i <= largeSeedConfig.patients; i++) {
      const gender = i % 2 === 0 ? Gender.FEMALE : Gender.MALE;

      users.push(
        this.userRepository.create({
          full_name: fullName(gender),
          phone: patientPhone(i),
          role: UserRole.PATIENT,
          gender,
          birth_date: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
        }),
      );
    }

    const savedUsers: User[] = [];

    for (const batch of chunk(users, BATCH_SIZE)) {
      savedUsers.push(...(await this.userRepository.save(batch)));
    }

    const patients = savedUsers.map((user) =>
      this.patientRepository.create({
        userId: user.id,
        user,
        address: patientAddress(),
        blood_type: bloodType(),
        allergies: faker.datatype.boolean({ probability: 0.3 })
          ? faker.helpers.arrayElement(ALLERGIES)
          : undefined,
        chronic_diseases: faker.datatype.boolean({ probability: 0.25 })
          ? faker.helpers.arrayElement(CHRONIC_DISEASES)
          : undefined,
        previous_operations: faker.datatype.boolean({ probability: 0.2 })
          ? faker.helpers.arrayElement(PREVIOUS_OPERATIONS)
          : undefined,
        permanent_medications: faker.datatype.boolean({ probability: 0.2 })
          ? faker.helpers.arrayElement(PERMANENT_MEDICATIONS)
          : undefined,
        tall: faker.number.int({ min: 150, max: 195 }),
        weight: faker.number.int({ min: 48, max: 110 }),
      }),
    );

    const savedPatients: Patient[] = [];

    for (const batch of chunk(patients, BATCH_SIZE)) {
      savedPatients.push(...(await this.patientRepository.save(batch)));
    }

    this.logger.log(`${savedPatients.length} patients seeded`);

    return savedPatients;
  }

  private async seedAppointments(
    admin: User,
    doctors: Doctor[],
    patients: Patient[],
    reasons: CancellationReason[],
  ): Promise<void> {
    const plan = buildStatusPlan(largeSeedConfig.appointments, doctors.length);
    const now = new Date();
    const runDate = toDateOnly(today());
    const appointments: Appointment[] = [];

    let startIndex = 0;

    plan.forEach((status) => {
      // One live consultation per doctor, everything else picks a doctor at random.
      const doctor =
        status === AppointmentStatus.START
          ? doctors[startIndex++]
          : faker.helpers.arrayElement(doctors);
      const price = Number(doctor.examination_price);
      const paymentStatus = paymentStatusFor(status);

      const appointment = this.appointmentRepository.create({
        patient: faker.helpers.arrayElement(patients),
        doctor,
        department: doctor.specialty,
        appointment_date: this.dateFor(status, runDate),
        ...appointmentSlot(),
        status,
        payment_status: paymentStatus,
        creator: admin,
        deposit_amount:
          paymentStatus === PaymentStatus.UNPAID
            ? null
            : LARGE_SEED_DEPOSIT_AMOUNT,
        collected_amount:
          paymentStatus === PaymentStatus.PAID ||
          paymentStatus === PaymentStatus.REFUNDED
            ? price
            : null,
        is_updated_by_patient: faker.datatype.boolean({ probability: 0.15 }),
      });

      this.applyQueueFields(appointment, status, now);

      if (status === AppointmentStatus.CANCELLED) {
        const reason = faker.helpers.arrayElement(reasons);
        appointment.cancellation_reason_ref = reason;
        appointment.cancellation_reason = reason.label;
      }

      appointments.push(appointment);
    });

    const savedAppointments: Appointment[] = [];

    for (const batch of chunk(appointments, BATCH_SIZE)) {
      savedAppointments.push(...(await this.appointmentRepository.save(batch)));
    }

    this.logger.log(
      `${savedAppointments.length} appointments seeded (${plan.filter((s) => s === AppointmentStatus.START).length} in consultation and ${plan.filter((s) => s === AppointmentStatus.WAITING).length} waiting today)`,
    );

    await this.seedVisitsAndReviews(savedAppointments);
  }

  /** Live rows are pinned to the run date; historical rows spread over the report window. */
  private dateFor(status: AppointmentStatus, runDate: string): Date {
    if (
      status === AppointmentStatus.WAITING ||
      status === AppointmentStatus.START
    ) {
      return runDate as unknown as Date;
    }

    const date =
      status === AppointmentStatus.PENDING
        ? futureWorkingDate()
        : pastWorkingDate(largeSeedConfig.months);

    return toDateOnly(date) as unknown as Date;
  }

  /**
   * Waiting rows only carry an entry timestamp, while rows that already moved on
   * to a consultation carry the measured duration the waiting time report reads.
   */
  private applyQueueFields(
    appointment: Appointment,
    status: AppointmentStatus,
    now: Date,
  ): void {
    if (status === AppointmentStatus.WAITING) {
      appointment.waiting_entered_at = new Date(
        now.getTime() - faker.number.int({ min: 1, max: 120 }) * 60_000,
      );

      return;
    }

    if (status === AppointmentStatus.START) {
      const duration = waitingDurationSeconds();
      appointment.waiting_duration_seconds = duration;
      appointment.waiting_entered_at = new Date(
        now.getTime() -
          (duration + faker.number.int({ min: 60, max: 900 })) * 1000,
      );

      return;
    }

    if (
      status === AppointmentStatus.COMPLETE &&
      faker.datatype.boolean({ probability: COMPLETED_WITH_MEASURED_WAIT_RATE })
    ) {
      appointment.waiting_duration_seconds = waitingDurationSeconds();
    }
  }

  private async seedVisitsAndReviews(
    appointments: Appointment[],
  ): Promise<void> {
    const completed = appointments.filter(
      (appointment) => appointment.status === AppointmentStatus.COMPLETE,
    );

    const visits: Visit[] = [];
    const reviews: AppointmentReview[] = [];

    for (const appointment of completed) {
      if (faker.datatype.boolean({ probability: VISIT_RATE })) {
        const note = clinicalNote(appointment.department.title);

        visits.push(
          this.visitRepository.create({
            appointment_id: appointment.id,
            diagnosis: note.diagnosis,
            medicals: note.medicals,
            suggestions: note.suggestions,
            total_price: Number(appointment.doctor.examination_price),
          }),
        );
      }

      if (faker.datatype.boolean({ probability: REVIEW_RATE })) {
        const score = reviewScore();

        reviews.push(
          this.reviewRepository.create({
            appointment,
            score,
            comment: reviewComment(score),
          }),
        );
      }
    }

    for (const batch of chunk(visits, BATCH_SIZE)) {
      await this.visitRepository.save(batch);
    }

    for (const batch of chunk(reviews, BATCH_SIZE)) {
      await this.reviewRepository.save(batch);
    }

    this.logger.log(
      `${visits.length} visits and ${reviews.length} reviews seeded`,
    );
  }

  /**
   * TypeORM owns creation timestamps on insert, so they are realigned afterwards:
   * bookings land before the appointment, visits and reviews just after it. The
   * ratings report filters on `review.created_at`, so this keeps it inside range.
   */
  private async alignTimestamps(): Promise<void> {
    await this.dataSource.query(`
      UPDATE appointments
      SET created_at = TIMESTAMPADD(DAY, -FLOOR(1 + RAND() * 14), TIMESTAMP(appointment_date, start_time))
    `);

    await this.dataSource.query(`
      UPDATE visits v
      INNER JOIN appointments a ON a.id = v.appointment_id
      SET v.created_at = TIMESTAMP(a.appointment_date, a.end_time),
          v.updated_at = TIMESTAMP(a.appointment_date, a.end_time)
    `);

    await this.dataSource.query(`
      UPDATE appointment_reviews r
      INNER JOIN appointments a ON a.id = r.appointment_id
      SET r.created_at = TIMESTAMPADD(HOUR, 2, TIMESTAMP(a.appointment_date, a.end_time)),
          r.updated_at = TIMESTAMPADD(HOUR, 2, TIMESTAMP(a.appointment_date, a.end_time))
    `);

    this.logger.log('Creation timestamps aligned with appointment dates');
  }

  /** Keeps the doctor profile rating consistent with the reviews that were generated. */
  private async refreshDoctorRatings(doctors: Doctor[]): Promise<void> {
    const averages = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.appointment', 'appointment')
      .select('appointment.doctor_id', 'doctorId')
      .addSelect('AVG(review.score)', 'averageScore')
      .groupBy('appointment.doctor_id')
      .getRawMany<{ doctorId: number; averageScore: string }>();

    const byDoctor = new Map(
      averages.map((row) => [Number(row.doctorId), Number(row.averageScore)]),
    );

    for (const doctor of doctors) {
      const average = byDoctor.get(doctor.user_id);

      await this.doctorRepository.update(doctor.user_id, {
        average_rating: average
          ? Math.round(average * 100) / 100
          : faker.number.float({ min: 3.5, max: 4.9, fractionDigits: 2 }),
      });
    }

    this.logger.log('Doctor profile ratings recalculated from reviews');
  }

  private logCredentials(): void {
    this.logger.log(
      [
        'Test credentials:',
        `  admin     ${ADMIN_PHONE} / ${ADMIN_PASSWORD}`,
        `  doctor    ${doctorPhone(1)} / ${DOCTOR_PASSWORD}`,
        `  secretary ${secretaryPhone(1)} / ${SECRETARY_PASSWORD}`,
        `  patient   ${patientPhone(1)} (OTP login, no password)`,
      ].join('\n'),
    );
  }
}
