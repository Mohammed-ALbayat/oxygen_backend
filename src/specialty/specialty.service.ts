import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
  ) {}

    async createSpecialty(dto: CreateSpecialtyDto) {
        const existing = await this.specialtyRepository.findOne({
          where: { title: dto.title },
        });
        if (existing) {
          throw new ConflictException('Specialty with this title already exists');
        }
        const specialty = this.specialtyRepository.create(dto);
        return this.specialtyRepository.save(specialty);
      }
}
