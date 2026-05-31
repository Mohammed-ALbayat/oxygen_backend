import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

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

  async updateSpecialty(id: number, dto: UpdateSpecialtyDto) {
    const specialty = await this.specialtyRepository.findOne({ where: { id } });
    if (!specialty) {
      throw new NotFoundException('Specialty not found');
    }

    // شوف اذا العنوان موجود مسبقا ماعدا العنوان الحالي
    if (dto.title && dto.title !== specialty.title) {
      const existing = await this.specialtyRepository.findOne({
        where: { title: dto.title, id: Not(id) },
      });
      if (existing) {
        throw new ConflictException('Specialty with this title already exists');
      }
    }

    Object.assign(specialty, dto);
    return this.specialtyRepository.save(specialty);
  }
}
