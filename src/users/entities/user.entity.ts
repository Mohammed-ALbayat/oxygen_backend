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
import { UserRole } from '../enums/user-roles.enum';
import { UserStatus } from '../enums/user-status.enum';
import { Gender } from '../enums/gender.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  full_name: string | null;

  @Column({
    type: 'varchar',
    unique: true,
  })
  @Matches(/^09\d{8}$/, {
    message: 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام',
  })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

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

  @Column({
    type: 'date',
    nullable: true,
  })
  birth_date: Date | null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({ type: 'varchar', nullable: true })
  image_path?: string | null;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  doctor: Doctor;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient: Patient;

  @OneToOne(() => Secretary, (secretary) => secretary.user)
  secretary: Secretary;
}
