import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Patient } from './entities/patient.entity';
import { generateToken } from '../auth/utils/jwt.util';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePatientProfileDto } from './dto/create-profile-patient.dto';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/entities/user.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdatePatientProfileDto } from './dto/update-profile-patient.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async registerPatient(dto: CreatePatientDto) {
    const existing = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('رقم الهاتف موجود مسبقاً');
    }
    const patient = this.userRepository.create({
      full_name: dto.full_name,
      username: dto.username,
      phone: dto.phone,
      role: UserRole.PATIENT,
    });
    const savedPatient = await this.userRepository.save(patient);
    // إرسال OTP للمريض
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    savedPatient.otp_code = otp;
    savedPatient.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await this.userRepository.save(savedPatient);
    return savedPatient;
  }

  async createPatient(dto: CreatePatientDto) {
    const existing = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('رقم الهاتف موجود مسبقاً');
    }
    const patient = this.userRepository.create({
      full_name: dto.full_name,
      username: dto.username,
      phone: dto.phone,
      role: UserRole.PATIENT,
    });

    const savedPatient = await this.userRepository.save(patient);
    return savedPatient;
  }

  async createPatientProfile(userId: number, dto: CreatePatientProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.PATIENT },
    });

    if (!user) {
      throw new NotFoundException('المريض غير موجود');
    }

    const existingProfile = await this.patientRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingProfile) {
      throw new ConflictException('الملف الشخصي للمريض موجود مسبقاً');
    }

    const patientProfile = this.patientRepository.create({
      user: user,
      birth_date: dto.birth_date,
      address: dto.address,
    });
    return await this.patientRepository.save(patientProfile);
  }

  async updatePatient(id: number, updateData: UpdatePatientDto) {
    const patient = await this.userRepository.findOne({
      where: { id },
    });
    if (!patient) {
      throw new NotFoundException('المريض غير موجود');
    }
    if (updateData.full_name !== undefined) {
      patient.full_name = updateData.full_name;
    }
    if (updateData.username !== undefined) {
      patient.username = updateData.username;
    }

    return await this.userRepository.save(patient);
  }

  async updatePatientProfile(userId: number, dto: UpdatePatientProfileDto) {
    const patientProfile = await this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!patientProfile) {
      throw new NotFoundException('الملف الشخصي للمريض غير موجود');
    }

    if (dto.birth_date !== undefined) {
      patientProfile.birth_date = dto.birth_date;
    }
    if (dto.address !== undefined) {
      patientProfile.address = dto.address;
    }
    if (dto.gender !== undefined) {
      patientProfile.gender = dto.gender;
    }
    if (dto.blood_type !== undefined) {
      patientProfile.blood_type = dto.blood_type;
    }
    if (dto.allergies !== undefined) {
      patientProfile.allergies = dto.allergies;
    }
    if (dto.previous_operations !== undefined) {
      patientProfile.previous_operations = dto.previous_operations;
    }
    if (dto.chronic_diseases !== undefined) {
      patientProfile.chronic_diseases = dto.chronic_diseases;
    }
    if (dto.weight !== undefined) {
      patientProfile.weight = dto.weight;
    }
    if (dto.tall !== undefined) {
      patientProfile.tall = dto.tall;
    }

    return await this.patientRepository.save(patientProfile);
  }

  async sendOtp(phone: string) {
    const user = await this.userRepository.findOne({
      where: {
        phone,
        role: UserRole.PATIENT,
      },
    });

    if (!user) {
      throw new NotFoundException('المريض غير موجود');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await this.userRepository.save(user);

    console.log('OTP:', otp);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, otp: string) {
    const user = await this.userRepository.findOne({
      where: {
        phone,
        role: UserRole.PATIENT,
      },
    });

    if (!user || user.otp_code !== otp) {
      throw new BadRequestException('OTP غير صحيح');
    }

    if (user.otp_expires_at === null || user.otp_expires_at < new Date()) {
      throw new BadRequestException('OTP منتهي الصلاحية');
    }
    user.otp_code = null;
    user.otp_expires_at = null;
    user.is_verified = true;
    user.token_version += 1;
    await this.userRepository.save(user);

    return generateToken(user, UserRole.PATIENT, this.jwtService);
    // return { generateToken(user, UserRole.PATIENT, this.jwtService),
    //   message: 'OTP verified' };
  }

  async loginPatient(phone: string) {
    const user = await this.userRepository.findOne({
      where: {
        phone,
        role: UserRole.PATIENT,
      },
    });

    if (!user) {
      throw new NotFoundException('المريض غير موجود');
    }
    user.token_version += 1;
    await this.userRepository.save(user);
    return generateToken(user, UserRole.PATIENT, this.jwtService);
  }
}
