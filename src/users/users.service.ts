import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserStatus } from './entities/user.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { BadRequestException } from '@nestjs/common';


@Injectable()
export class UsersService {
  constructor(
  @InjectRepository(User)
  private userRepository: Repository<User>,

  @InjectRepository(Doctor)
  private doctorRepository: Repository<Doctor>,

  @InjectRepository(Specialty)
  private specialtyRepository: Repository<Specialty>,

  @InjectRepository(Patient)
  private patientRepository: Repository<Patient>,

  @InjectRepository(Secretary)
  private secretaryRepository: Repository<Secretary>,

  ) {}




  async createUser(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('رقم الهاتف موجود مسبقاً');
    }
    if (dto.role !== UserRole.PATIENT && !dto.password) {
      throw new BadRequestException('Password is required');
    }

    let hashedPassword: string = "";
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }
    const user = this.userRepository.create({
      full_name: dto.full_name,
      phone: dto.phone,
      password: hashedPassword,
      role: dto.role,
    });

    const savedUser = await this.userRepository.save(user);

    if (dto.role === UserRole.DOCTOR && dto.doctor) {
      const specialty = await this.specialtyRepository.findOne({
        where: {
          id: dto.doctor.specialty_id,
        },
      });

      if (!specialty) {
        throw new NotFoundException('القسم غير موجود');
      }
      const doctor = this.doctorRepository.create({
        user: savedUser,
        specialty: specialty,
        specialization: dto.doctor.specialization,
        bio: dto.doctor.bio,
        examination_price: dto.doctor.examination_price,
        doctor_percentage: dto.doctor.doctor_percentage,
      });

      await this.doctorRepository.save(doctor);
    }

    else if (dto.role === UserRole.PATIENT && dto.patient) {
      const patient = this.patientRepository.create({
        user: savedUser,
        birth_date: dto.patient.birth_date,
        gender: dto.patient.gender,
        blood_type: dto.patient.blood_type,
        allergies: dto.patient.allergies,
        chronic_diseases: dto.patient.chronic_diseases,
        previous_operations: dto.patient.previous_operations,
        permanent_medications: dto.patient.permanent_medications,
        tall: dto.patient.tall,
        weight: dto.patient.weight,
        address: dto.patient.address,
      });
      await this.patientRepository.save(patient);
    }

    else if (dto.role === UserRole.SECRETARY && dto.secretary) {
      const secretary = this.secretaryRepository.create({
        user: savedUser,
        shift_start: dto.secretary.shift_start,
        shift_end: dto.secretary.shift_end,
      });
      await this.secretaryRepository.save(secretary);
    }

    return savedUser;
  }




  async updateUser(id: number, dto: Partial<CreateUserDto>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(user);
  }



  async blockUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = UserStatus.BLOCKED;
    return this.userRepository.save(user);
  }

  async unblockUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async togglestatus(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
        throw new NotFoundException('User not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    return this.userRepository.save(user);
  }



  async getAllUsers() {
    return this.userRepository.find();
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserByFullName(full_name: string) {
    return this.userRepository.findOne({ where: { full_name } });
  }

  async getUserByPhone(phone: string) {
    return this.userRepository.findOne({ where: { phone } });
  }

  async getUsersByRole(role: UserRole) {
    return this.userRepository.find({ where: { role } });
  }


 async findAll(query: any) {

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const qb = this.userRepository.createQueryBuilder('user');

  if (query.full_name?.trim()) {
    qb.andWhere(
      'user.full_name LIKE :full_name',
      {
        full_name: `%${query.full_name.trim()}%`,
      },
    );
  }

  if (query.phone?.trim()) {
    qb.andWhere(
      'user.phone LIKE :phone',
      {
        phone: `%${query.phone.trim()}%`,
      },
    );
  }

  if (query.role?.trim()) {
    qb.andWhere(
      'user.role = :role',
      {
        role: query.role.trim(),
      },
    );
  }

  const skip = (page - 1) * limit;
  qb.skip(skip).take(limit);
  const [data, total] = await qb.getManyAndCount();
  return {
    data,
    total,
    currentPage: page,
    lastPage: Math.ceil(total / limit),
  };
}
}