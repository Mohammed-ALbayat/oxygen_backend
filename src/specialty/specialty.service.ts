import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
  ) {}

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const specialty = this.specialtyRepository.create(createSpecialtyDto);

    return this.specialtyRepository.save(specialty);
  }

  async findAll() {
    return this.specialtyRepository.find({ where: { published: true } });
  }

  async findOne(id: number) {
    return this.specialtyRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updateSpecialtyDto: UpdateSpecialtyDto) {
    return this.specialtyRepository.update({ id: id }, updateSpecialtyDto);
  }

  async remove(id: number) {
    return this.specialtyRepository.delete({ id: id });
  }
}
