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
import { toStorageUrl } from 'src/storage/utils/storage-url.util';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class SpecialtyService {
  constructor(
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
    private readonly i18n: I18nService,
  ) {}

  async createSpecialty(dto: CreateSpecialtyDto) {
    const existing = await this.specialtyRepository.findOne({
      where: { title: dto.title },
    });
    if (existing) {
      throw new ConflictException(
        this.i18n.t('specialty.TITLE_ALREADY_EXISTS'),
      );
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
        throw new ConflictException(
        this.i18n.t('specialty.TITLE_ALREADY_EXISTS'),
      );
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
        image_path: true,
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
            image_path: true,
          },
        },
      },
    });
  }

  async findAllPublished() {
    const specialties = await this.specialtyRepository.find({
      where: { published: true },
      select: ['id', 'title', 'image_path'],
      order: { id: 'DESC' },
    });

    return specialties.map(({ id, title, image_path }) => ({
      id,
      title,
      image_path: toStorageUrl(image_path),
    }));
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
        image_path: true,
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
            image_path: true,
          },
        },
      },
    });

    if (!specialty) {
      throw new NotFoundException(
        this.i18n.t('specialty.NOT_FOUND_WITH_ID', { args: { id } }),
      );
    }

    return specialty;
  }

  async remove(id: number) {
    const specialty = await this.findOne(id);

    if (specialty.doctors?.length > 0) {
      throw new BadRequestException(
        this.i18n.t('specialty.CANNOT_DELETE_WITH_DOCTORS'),
      );
    }

    await this.specialtyRepository.remove(specialty);
    return { deleted: true, id };
  }
}
