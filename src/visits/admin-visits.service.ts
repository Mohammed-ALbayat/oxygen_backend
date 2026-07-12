import { Injectable, NotFoundException } from '@nestjs/common';
import { Visit } from './entities/visit.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminVisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
  ) {}

  async findAll() {
    const visits = await this.visitRepository.find();
    return visits;
  }

  async findOne(id: number) {
    const visit = await this.visitRepository.findOne({ where: { id: id } });
    if (!visit) {
      throw new NotFoundException('هذه الزيارة غير موجودة');
    }
    return visit;
  }
}
