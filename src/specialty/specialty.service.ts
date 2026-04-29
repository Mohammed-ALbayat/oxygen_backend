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

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    try {
      const specialty = this.specialtyRepository.create(createSpecialtyDto);
      const saved = await this.specialtyRepository.save(specialty);
      
      return {
        message: 'تم إضافة التخصص بنجاح',
        data: saved
      };
    } catch (error: any) {
      // التحقق من كود الخطأ الخاص بالتكرار في MySQL/MariaDB
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException('هذا التخصص موجود مسبقاً');
      }
      throw error;
    }
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
