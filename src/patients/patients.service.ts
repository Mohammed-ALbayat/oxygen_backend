import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePatientProfileDto } from './dto/create-profile-patient.dto';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/entities/user.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdatePatientProfileDto } from './dto/update-profile-patient.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { PatientMeResponseDto } from './dto/patient-me-response.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPatient(dto: CreatePatientDto) {
    const existing = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('رقم الهاتف موجود مسبقاً');
    }
    const patient = this.userRepository.create({
      full_name: dto.full_name,
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

    this.applyProfileUpdates(patientProfile, dto);

    return await this.patientRepository.save(patientProfile);
  }


  async getMe(user: User): Promise<PatientMeResponseDto> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id, role: UserRole.PATIENT },
    });

    if (!currentUser) {
      throw new NotFoundException('المريض غير موجود');
    }

    const profile = await this.patientRepository.findOne({
      where: { user: { id: user.id } },
    });

    return this.toMeResponse(currentUser, profile);
  }


  async updateMe(user: User, dto: UpdateMeDto): Promise<PatientMeResponseDto> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id, role: UserRole.PATIENT },
    });

    if (!currentUser) {
      throw new NotFoundException('المريض غير موجود');
    }

    if (dto.full_name !== undefined) {
      currentUser.full_name = dto.full_name;
    }
    await this.userRepository.save(currentUser);

    let profile = await this.patientRepository.findOne({
      where: { user: { id: user.id } },
    });


    const hasProfileFields =
      dto.birth_date !== undefined ||
      dto.address !== undefined ||
      dto.gender !== undefined ||
      dto.blood_type !== undefined ||
      dto.allergies !== undefined ||
      dto.previous_operations !== undefined ||
      dto.chronic_diseases !== undefined ||
      dto.permanent_medications !== undefined ||
      dto.tall !== undefined ||
      dto.weight !== undefined;

    if (hasProfileFields) {
      if (!profile) {
        profile = this.patientRepository.create({ user: currentUser });
      }
      this.applyProfileUpdates(profile, dto);
      profile = await this.patientRepository.save(profile);
    }

    return this.toMeResponse(currentUser, profile ?? null);
  }


  private applyProfileUpdates(
    profile: Patient,
    dto: UpdatePatientProfileDto | UpdateMeDto,
  ) {
    if (dto.birth_date !== undefined) {
      profile.birth_date = dto.birth_date;
    }
    if (dto.address !== undefined) {
      profile.address = dto.address;
    }
    if (dto.gender !== undefined) {
      profile.gender = dto.gender;
    }
    if (dto.blood_type !== undefined) {
      profile.blood_type = dto.blood_type;
    }
    if (dto.allergies !== undefined) {
      profile.allergies = dto.allergies;
    }
    if (dto.previous_operations !== undefined) {
      profile.previous_operations = dto.previous_operations;
    }
    if (dto.chronic_diseases !== undefined) {
      profile.chronic_diseases = dto.chronic_diseases;
    }
    if (dto.permanent_medications !== undefined) {
      profile.permanent_medications = dto.permanent_medications;
    }
    if (dto.weight !== undefined) {
      profile.weight = dto.weight;
    }
    if (dto.tall !== undefined) {
      profile.tall = dto.tall;
    }
  }


  private toMeResponse(
    user: User,
    profile: Patient | null,
  ): PatientMeResponseDto {
    return {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      profile: profile
        ? {
            birth_date: profile.birth_date ?? null,
            address: profile.address ?? null,
            gender: profile.gender ?? null,
            blood_type: profile.blood_type ?? null,
            allergies: profile.allergies ?? null,
            previous_operations: profile.previous_operations ?? null,
            chronic_diseases: profile.chronic_diseases ?? null,
            permanent_medications: profile.permanent_medications ?? null,
            tall: profile.tall ?? null,
            weight: profile.weight ?? null,
          }
        : null,
    };
  }
}
