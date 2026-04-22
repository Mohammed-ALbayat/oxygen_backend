import { Gender } from 'src/common/enums/gender.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  phone_number: string;

  @Column()
  password: string;

  @Column()
  birth_date: Date;

  @Column()
  address: string;

  @Column({ enum: Gender })
  gender: Gender;

  @Column({ nullable: true })
  blood_type?: string;

  @Column({ nullable: true })
  allergies?: string;

  @Column({ nullable: true })
  previous_operations?: string;

  @Column({ nullable: true })
  chronic_diseases?: string;

  @Column({ nullable: true })
  permanent_medications?: string;

  @Column('int', { nullable: true })
  tall?: number;

  @Column('int', { nullable: true })
  weight?: number;

  @CreateDateColumn()
  created_at: Timestamp;

  @UpdateDateColumn()
  updated_at: Timestamp;
}
