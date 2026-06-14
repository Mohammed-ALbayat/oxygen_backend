import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('secretaries')
export class Secretary {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, (user) => user.secretary, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  shift_start: string;

  @Column({ type: 'varchar', nullable: true })
  shift_end: string;

  @Column({ default: true })
  is_active: boolean;
}
