import { Doctor } from 'src/doctors/entities/doctor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    default: DayOfWeek.MONDAY,
  })
  day_of_week: DayOfWeek;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column('int')
  slot_duration: number;

  @Column({ default: true })
  is_active: boolean;
}
