import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PatientVisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    private readonly i18n: I18nService,
  ) {}

  async findAll(user_id: number) {
    const visits = await this.visitRepository.find({
      where: { appointment: { patient: { userId: user_id } } },
    });
    return visits;
  }

  async findOne(user_id: number, id: number) {
    const visit = await this.visitRepository.findOne({
      where: { appointment: { patient: { userId: user_id } }, id: id },
    });
    if (!visit) {
      throw new NotFoundException(
        this.i18n.t('visits.VISIT_NOT_FOUND'),
      );
    }
    return visit;
  }
}
