import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('appointment_reviews')
export class AppointmentReview {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Appointment, (appointment) => appointment.review, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ type: 'tinyint' })
  score: number;

  @Column('text', { nullable: true })
  comment: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
