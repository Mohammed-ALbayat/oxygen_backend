import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CancellationReason } from 'src/cancellation-reasons/entities/cancellation-reason.entity';

@Injectable()
export class CancellationReasonsSeed {
  constructor(
    @InjectRepository(CancellationReason)
    private readonly cancellationReasonRepository: Repository<CancellationReason>,
  ) {}

  async seed() {
    const count = await this.cancellationReasonRepository.count();

    if (count > 0) {
      console.log('Cancellation reasons already seeded');
      return;
    }

    const reasons = [
      { label: 'Schedule conflict' },
      { label: 'Feeling better' },
      { label: 'Found another doctor' },
      { label: 'Financial reasons' },
      { label: 'Other' },
    ];

    await this.cancellationReasonRepository.save(reasons);
    console.log('Cancellation reasons seeded successfully');
  }
}
