import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Specialty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column('boolean')
  published: boolean;

  @Column({ nullable: true })
  image_path: string;

  @OneToMany(() => Doctor, (doctor) => doctor.specialty)
  doctors: Doctor[];
}
