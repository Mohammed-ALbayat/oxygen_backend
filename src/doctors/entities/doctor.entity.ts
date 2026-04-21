import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Timestamp,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DaysOfWeek } from 'src/common/enums/day-of-week.enum';
import { Specialty } from 'src/specialty/entities/specialty.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  image: string;

  @Column()
  phone_number: string;

  @Column('int')
  salary: number;

  @Column('boolean', { default: true })
  published: boolean;

  @ManyToOne(() => Specialty, (specialty) => specialty.doctors)
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @Column({ nullable: true })
  certification?: string;

  @Column({ type: 'json', nullable: true })
  working_hours?: { day: DaysOfWeek; start_time: string; end_time: string }[];

  @CreateDateColumn()
  created_at: Timestamp;

  @UpdateDateColumn()
  updated_at: Timestamp;

  constructor(doctor: Partial<Doctor>) {
    Object.assign(this, doctor);
  }
}
