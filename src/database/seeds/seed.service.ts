import { Injectable } from '@nestjs/common';

import { AdminSeed } from './admin.seed';
import { DoctorsSeed } from './doctors.seed';
import { PatientsSeed } from './patients.seed';
import { SecretariesSeed } from './secretaries.seed';
import { SpecialtiesSeed } from './specialties.seed';
import { DemoDoctorSeed } from './demo-doctor.seed';
import { AppointmentsSeed } from './appointments.seed';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { DataSource } from 'typeorm';
@Injectable()
export class SeedService {
  constructor(
    private adminSeed: AdminSeed,
    private doctorsSeed: DoctorsSeed,
    private patientsSeed: PatientsSeed,
    private secretariesSeed: SecretariesSeed,
    private specialtiesSeed: SpecialtiesSeed,
    private demoDoctorSeed: DemoDoctorSeed,
    private appointmentsSeed: AppointmentsSeed,

    private dataSource: DataSource,

    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,

    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,

    @InjectRepository(Secretary)
    private secretaryRepository: Repository<Secretary>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
  ) {}

  async reset() {
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    // 1. امسح كل الجداول (بالترتيب الصحيح بسبب العلاقات)
    await this.appointmentRepository.clear();
    await this.scheduleRepository.clear();
    await this.doctorRepository.clear();
    await this.patientRepository.clear();
    await this.secretaryRepository.clear();
    await this.userRepository.clear();
    await this.specialtyRepository.clear();

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('DB cleared');

    // 2. أعد التعبئة
    await this.adminSeed.seed();
    await this.specialtiesSeed.seed();
    await this.doctorsSeed.seed();
    await this.patientsSeed.seed();
    await this.secretariesSeed.seed();
    await this.demoDoctorSeed.seed();
    await this.appointmentsSeed.seed();

    console.log('DB reseeded');
  }
}
