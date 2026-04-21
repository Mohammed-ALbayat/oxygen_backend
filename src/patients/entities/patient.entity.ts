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

  //   @Column()
  //   image: string;

  @Column()
  phone_number: string;

  @Column()
  birth_date: Date;

  @Column()
  address: string;

  @Column()
  gender: string;

  @Column()
  blood_type?: string;

  @Column()
  allergies?: string;

  @Column()
  previous_operations?: string;

  @Column()
  chronic_diseases?: string;

  @Column()
  permanent_medications?: string;

  @Column('int')
  tall?: number;

  @Column('int')
  weight?: number;

  @CreateDateColumn()
  created_at: Timestamp;

  @UpdateDateColumn()
  updated_at: Timestamp;

  constructor(patient: Partial<Patient>) {
    Object.assign(this, patient);
  }
}
