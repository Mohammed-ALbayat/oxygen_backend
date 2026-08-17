import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancellationReason } from './entities/cancellation-reason.entity';
import { CreateCancellationReasonDto } from './dto/create-cancellation-reason.dto';

@Injectable()
export class CancellationReasonsService {
  constructor(
    @InjectRepository(CancellationReason)
    private cancellationReasonRepository: Repository<CancellationReason>,
  ) {}

  async findActive() {
    return this.cancellationReasonRepository.find({
      where: { is_active: true },
      order: { label: 'ASC' },
    });
  }

  async findAll() {
    return this.cancellationReasonRepository.find({
      order: { label: 'ASC' },
    });
  }

  async create(dto: CreateCancellationReasonDto) {
    const label = dto.label.trim();

    const existing = await this.cancellationReasonRepository.findOne({
      where: { label },
    });

    if (existing) {
      throw new ConflictException(
        'Cancellation reason with this label already exists',
      );
    }

    const reason = this.cancellationReasonRepository.create({ label });

    return this.cancellationReasonRepository.save(reason);
  }

  async setActive(id: number, isActive: boolean) {
    const reason = await this.findOne(id);

    reason.is_active = isActive;

    return this.cancellationReasonRepository.save(reason);
  }

  async findOne(id: number) {
    const reason = await this.cancellationReasonRepository.findOne({
      where: { id },
    });

    if (!reason) {
      throw new NotFoundException(
        `Cancellation reason with ID #${id} not found`,
      );
    }

    return reason;
  }

  /**
   * Resolves a reason that a patient is allowed to pick. Retired reasons stay in
   * the table for reporting history but can no longer be selected.
   */
  async findActiveOne(id: number) {
    const reason = await this.findOne(id);

    if (!reason.is_active) {
      throw new BadRequestException(
        'This cancellation reason is no longer available',
      );
    }

    return reason;
  }
}
