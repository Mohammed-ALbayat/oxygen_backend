import { Injectable, NotFoundException } from '@nestjs/common';
import { Visit } from './entities/visit.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AdminVisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    private readonly i18n: I18nService,
  ) {}

  async findAll(page: number, limit: number, patientId?: number) {
    const [data, total] = await this.visitRepository.findAndCount({
      where: patientId
        ? { appointment: { patient: { userId: patientId } } }
        : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      currentPage: page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const visit = await this.visitRepository.findOne({ where: { id: id } });
    if (!visit) {
      throw new NotFoundException(
        this.i18n.t('visits.VISIT_NOT_FOUND'),
      );
    }
    return visit;
  }

  async remove(id: number) {
    const visit = await this.findOne(id);

    await this.visitRepository.remove(visit);

    return {
      message: this.i18n.t('visits.VISIT_DELETED', { args: { id } }),
    };
  }
}
