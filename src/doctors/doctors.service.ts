import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Doctor } from './entities/doctor.entity';
import { NotFoundException } from '@nestjs/common';
import { UpdateDoctorFullDto } from './dto/update-doctor.dto';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,

    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createDoctor(dto: CreateDoctorDto) {
    const existing = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('رقم الهاتف موجود مسبقاً');
    }
    let hashedPassword: string = '';
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }
    const user = this.userRepository.create({
      full_name: dto.full_name,
      phone: dto.phone,
      password: hashedPassword,
      role: UserRole.DOCTOR,
    });
    const savedUser = await this.userRepository.save(user);
    const specialty = await this.specialtyRepository.findOne({
      where: { id: dto.specialty_id },
    });
    if (!specialty) {
      throw new NotFoundException('القسم غير موجود');
    }
    const doctor = this.doctorRepository.create({
      user: savedUser,
      specialty: specialty,
      specialization: dto.specialization,
      bio: dto.bio,
      examination_price: dto.examination_price,
      doctor_percentage: dto.doctor_percentage,
    });
    await this.doctorRepository.save(doctor);
    return savedUser;
  }

  async updateDoctor(id: number, updateData: UpdateDoctorFullDto) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['specialty', 'user'],
    });

    if (!doctor) {
      throw new NotFoundException('الطبيب غير موجود');
    }
    if (updateData.full_name !== undefined) {
      doctor.user.full_name = updateData.full_name;
    }

    if (updateData.specialty_id) {
      const specialty = await this.specialtyRepository.findOne({
        where: { id: updateData.specialty_id },
      });
      if (!specialty) {
        throw new NotFoundException('القسم غير موجود');
      }

      doctor.specialty = specialty;
    }

    if (updateData.specialization !== undefined) {
      doctor.specialization = updateData.specialization;
    }

    if (updateData.bio !== undefined) {
      doctor.bio = updateData.bio;
    }

    if (updateData.examination_price !== undefined) {
      doctor.examination_price = updateData.examination_price;
    }

    if (updateData.doctor_percentage !== undefined) {
      doctor.doctor_percentage = updateData.doctor_percentage;
    }

    return await this.doctorRepository.save(doctor);
  }
}
