import { Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const { specialty_id, ...doctorData } = createDoctorDto;

    const doctor = this.doctorRepository.create({
      ...doctorData,
      specialty: { id: specialty_id },
    });

    return await this.doctorRepository.save(doctor);
  }

  async findAll() {
    return this.doctorRepository.find({
      where: {
        published: true,
      },
    });
  }

  async findOne(id: number) {
    return this.doctorRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async findByUsername(username: string) {
    return this.doctorRepository.findOne({
      where: {
        username: username,
      },
    });
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    return this.doctorRepository.update({ id: id }, updateDoctorDto);
  }

  async remove(id: number) {
    return this.doctorRepository.delete({ id: id });
  }
}
