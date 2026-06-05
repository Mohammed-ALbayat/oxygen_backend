import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OtpPurpose {
  PATIENT_LOGIN = 'patient_login',
  PASSWORD_RESET = 'password_reset',
}

@Entity('otp_verifications')
export class OtpVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @Column({ length: 6 })
  code: string;

  @Column({
    type: 'enum',
    enum: OtpPurpose,
  })
  purpose: OtpPurpose;

  @Column({ type: 'datetime' })
  expires_at: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  created_at: Date;
}
