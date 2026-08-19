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
      throw new NotFoundException('هذه الزيارة غير موجودة');
    }
    return visit;
  }

  async remove(id: number) {
    const visit = await this.findOne(id);

    await this.visitRepository.remove(visit);

    return { message: `تم حذف الزيارة رقم #${id} بنجاح` };
  }
}
