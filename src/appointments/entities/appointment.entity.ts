import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { User } from 'src/users/entities/user.entity';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Specialty } from 'src/specialty/entities/specialty.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  WAITING = 'waiting',
  START = 'start',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PAID = 'paid',
  REFUNDED = 'refunded',
  INSURANCE = 'insurance',
  UNPAID = 'unpaid',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Specialty)
  @JoinColumn({ name: 'department_id' })
  department: Specialty;

  @Column({ type: 'date' })
  @IsDateString()
  appointment_date: Date;

  @Column({ type: 'time' })
  @IsString()
  start_time: string;

  @Column({ type: 'time' })
  @IsString()
  end_time: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  @IsEnum(PaymentStatus)
  payment_status: PaymentStatus;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  cancellation_reason?: string;

  @Column({ default: false })
  @IsBoolean()
  is_updated_by_patient: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;
}
