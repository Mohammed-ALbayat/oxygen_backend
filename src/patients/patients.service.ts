import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
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

  async getMe(user: User): Promise<PatientMeResponseDto> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id, role: UserRole.PATIENT },

      relations: ['patient'],
    });

    if (!currentUser) {
      throw new NotFoundException('المريض غير موجود');
    }

    return this.toMeResponse(currentUser, currentUser.patient ?? null);
  }

  async updateMe(user: User, dto: UpdateMeDto): Promise<PatientMeResponseDto> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id, role: UserRole.PATIENT },

      relations: ['patient'],
    });

    if (!currentUser) {
      throw new NotFoundException('المريض غير موجود');
    }

    if (dto.full_name !== undefined) {
      currentUser.full_name = dto.full_name;
    }

    if (dto.birth_date !== undefined) {
      currentUser.birth_date = dto.birth_date;
    }

    if (dto.gender !== undefined) {
      currentUser.gender = dto.gender;
    }

    await this.userRepository.save(currentUser);

    let profile = currentUser.patient;

    if (!profile) {
      profile = this.patientRepository.create({ user: currentUser });
    }

    this.applyPatientUpdates(profile, dto);

    profile = await this.patientRepository.save(profile);

    return this.toMeResponse(currentUser, profile);
  }

  private applyPatientUpdates(profile: Patient, dto: UpdateMeDto) {
    if (dto.address !== undefined) {
      profile.address = dto.address;
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
      full_name: user.full_name ?? null,
      phone: user.phone,
      birth_date: user.birth_date ?? null,
      gender: user.gender ?? null,
      address: profile?.address ?? null,
      blood_type: profile?.blood_type ?? null,
      allergies: profile?.allergies ?? null,
      previous_operations: profile?.previous_operations ?? null,
      chronic_diseases: profile?.chronic_diseases ?? null,
      permanent_medications: profile?.permanent_medications ?? null,
      tall: profile?.tall ?? null,
      weight: profile?.weight ?? null,
    };
  }
}
