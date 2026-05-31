import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.doctor, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Specialty, (specialty) => specialty.doctors)
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  schedules: DoctorSchedule[];

  @Column()
  specialization: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  examination_price: number;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 0,
  })
  doctor_percentage: number;

  @Column('decimal', {
    precision: 3,
    scale: 2,
    default: 0,
  })
  average_rating: number;
}
