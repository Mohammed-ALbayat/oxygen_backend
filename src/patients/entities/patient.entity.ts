import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

@Entity('patients')
export class Patient {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, (user) => user.patient, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text', {
    nullable: true,
  })
  address?: string;

  @Column({
    type: 'enum',
    enum: BloodType,
    nullable: true,
  })
  blood_type?: BloodType;

  @Column('text', {
    nullable: true,
  })
  allergies?: string;

  @Column('text', {
    nullable: true,
  })
  previous_operations?: string;

  @Column('text', {
    nullable: true,
  })
  chronic_diseases?: string;

  @Column('text', {
    nullable: true,
  })
  permanent_medications?: string;

  @Column('int', {
    nullable: true,
  })
  tall?: number;

  @Column('int', {
    nullable: true,
  })
  weight?: number;
}
