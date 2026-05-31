import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('secretaries')
export class Secretary {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.secretary, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  shift_start: string;

  @Column({ nullable: true })
  shift_end: string;

  @Column({ default: true })
  is_active: boolean;
}
