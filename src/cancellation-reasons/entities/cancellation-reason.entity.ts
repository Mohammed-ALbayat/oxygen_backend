import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cancellation_reasons')
export class CancellationReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  label: string;

  @Index()
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
