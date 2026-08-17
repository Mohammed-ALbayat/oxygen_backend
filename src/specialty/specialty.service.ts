import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

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
    const specialty = await this.findOne(id);

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

  async findAll() {
    return await this.specialtyRepository.find({
      order: {
        id: 'DESC',
      },
      relations: {
        doctors: {
          user: true,
        },
      },
      select: {
        id: true,
        title: true,
        published: true,
        doctors: {
          user_id: true,
          specialization: true,
          bio: true,
          examination_price: true,
          doctor_percentage: true,
          average_rating: true,
          user: {
            id: true,
            full_name: true,
          },
        },
      },
    });
  }

  async findAllPublished() {
    return this.specialtyRepository.find({
      where: { published: true },
      select: ['id', 'title'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const specialty = await this.specialtyRepository.findOne({
      where: { id },
      relations: {
        doctors: {
          user: true,
        },
      },
      select: {
        id: true,
        title: true,
        published: true,
        doctors: {
          user_id: true,
          specialization: true,
          bio: true,
          examination_price: true,
          doctor_percentage: true,
          average_rating: true,
          user: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    if (!specialty) {
      throw new NotFoundException(`Specialty with ID #${id} not found`);
    }

    return specialty;
  }

  async remove(id: number) {
    const specialty = await this.findOne(id);

    if (specialty.doctors?.length > 0) {
      throw new BadRequestException(
        'Cannot delete specialty that has associated doctors',
      );
    }

    await this.specialtyRepository.remove(specialty);
    return { deleted: true, id };
  }
}
