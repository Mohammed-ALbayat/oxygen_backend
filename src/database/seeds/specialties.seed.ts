import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Specialty } from 'src/specialty/entities/specialty.entity';

@Injectable()
export class SpecialtiesSeed {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  async seed() {
    const count = await this.specialtyRepository.count();

    if (count > 0) {
      console.log('Specialties already seeded');
      return;
    }

    const specialties = [
      {
        title: 'Cardiology',
        published: true,
      },
      {
        title: 'Dermatology',
        published: true,
      },
      {
        title: 'Orthopedics',
        published: true,
      },
    ];

    await this.specialtyRepository.save(specialties);
    console.log('Specialties seeded successfully');
  }
}
