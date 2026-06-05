import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { OneToOne } from 'typeorm';
import { Matches } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  SECRETARY = 'secretary',
  PATIENT = 'patient',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  full_name: string;

  @Column({
    unique: true,
  })
  @Matches(/^09\d{8}$/, {
    message: 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام',
  })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: 0 })
  token_version: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  doctor: Doctor;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient: Patient;

  @OneToOne(() => Secretary, (secretary) => secretary.user)
  secretary: Secretary;
}
