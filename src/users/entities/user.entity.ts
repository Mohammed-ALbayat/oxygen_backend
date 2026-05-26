import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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

  @Column()
  full_name: string;

  @Column({
    unique: true,
  })
  phone: string;

  @Column()
  username: string;

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

 @Column({ type: 'varchar', nullable: true })
  otp_code: string | null;


  @Column({ type: 'datetime', nullable: true })
otp_expires_at: Date | null;

  @Column({
    default: false,
  })
  is_verified: boolean;

  @Column({ default: 0 })
  token_version: number;

  @CreateDateColumn()
  created_at: Date;
}