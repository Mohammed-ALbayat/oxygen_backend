import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Gender } from 'src/users/enums/gender.enum';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { BloodType, Patient } from 'src/patients/entities/patient.entity';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';

const DEMO_DOCTOR_PHONE = '0988888800';

const DEMO_APPOINTMENT_PHONES = ['0988888801', '0988888802', '0988888803'];

const DEMO_APPOINTMENTS: {
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
}[] = [
  {
    appointment_date: '2026-06-09',
    start_time: '09:00:00',
    end_time: '09:30:00',
    status: AppointmentStatus.PENDING,
    payment_status: PaymentStatus.UNPAID,
  },
  {
    appointment_date: '2026-06-11',
    start_time: '14:00:00',
    end_time: '14:30:00',
    status: AppointmentStatus.ACTIVE,
    payment_status: PaymentStatus.PAID,
  },
  {
    appointment_date: '2026-06-11',
    start_time: '15:00:00',
    end_time: '15:30:00',
    status: AppointmentStatus.WAITING,
    payment_status: PaymentStatus.INSURANCE,
  },
];

@Injectable()
export class AppointmentsSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async seed() {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { phone: DEMO_DOCTOR_PHONE } },
      relations: ['user', 'specialty'],
    });

    if (!doctor) {
      console.log('Appointments seed skipped: demo doctor not found');
      return;
    }

    const existingCount = await this.appointmentRepository.count({
      where: { doctor: { user_id: doctor.user_id } },
    });

    if (existingCount >= DEMO_APPOINTMENTS.length) {
      console.log('Demo appointments already seeded');
      return;
    }

    const admin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (!admin) {
      console.log('Appointments seed skipped: admin not found');
      return;
    }

    const patients = await this.ensureDemoPatients();

    for (let i = existingCount; i < DEMO_APPOINTMENTS.length; i++) {
      const template = DEMO_APPOINTMENTS[i];
      const patient = patients[i];

      const appointment = this.appointmentRepository.create({
        patient,
        doctor,
        department: doctor.specialty,
        appointment_date: template.appointment_date as unknown as Date,
        start_time: template.start_time,
        end_time: template.end_time,
        status: template.status,
        payment_status: template.payment_status,
        creator: admin,
      });

      await this.appointmentRepository.save(appointment);
    }

    console.log('Demo appointments seeded successfully');
  }

  private async ensureDemoPatients(): Promise<Patient[]> {
    const patients: Patient[] = [];

    for (let i = 0; i < DEMO_APPOINTMENT_PHONES.length; i++) {
      let patient = await this.patientRepository.findOne({
        where: { user: { phone: DEMO_APPOINTMENT_PHONES[i] } },
        relations: ['user'],
      });

      if (!patient) {
        const user = this.userRepository.create({
          full_name: `Appointment Patient ${i}`,
          phone: DEMO_APPOINTMENT_PHONES[i],
          role: UserRole.PATIENT,
          birth_date: new Date(1995, i, 15),
          gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        });
        const savedUser = await this.userRepository.save(user);

        patient = this.patientRepository.create({
          userId: savedUser.id,
          user: savedUser,
          address: `Demo Street ${i}`,
          blood_type: BloodType.O_POSITIVE,
        });
        patient = await this.patientRepository.save(patient);
      }

      patients.push(patient);
    }

    return patients;
  }
}
