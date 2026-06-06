import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cancellation_reasons')
export class CancellationReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reason: string;
}
