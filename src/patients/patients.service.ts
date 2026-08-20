import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { UpdateMeDto } from './dto/update-me.dto';
import { PatientMeResponseDto } from './dto/patient-me-response.dto';
import { toPatientMeResponse } from './utils/patient-response.util';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  async getMe(user: User): Promise<PatientMeResponseDto> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id, role: UserRole.PATIENT },

      relations: ['patient'],
    });

    if (!currentUser) {
      throw new NotFoundException(
        this.i18n.t('patients.PATIENT_NOT_FOUND'),
      );
    }

    return toPatientMeResponse(currentUser, currentUser.patient ?? null);
  }

  async updateMe(user: User, dto: UpdateMeDto): Promise<PatientMeResponseDto> {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id, role: UserRole.PATIENT },

      relations: ['patient'],
    });

    if (!currentUser) {
      throw new NotFoundException(
        this.i18n.t('patients.PATIENT_NOT_FOUND'),
      );
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

    return toPatientMeResponse(currentUser, profile);
  }

  async search(
    page: number,
    limit: number,
    filters: { full_name?: string; phone?: string },
  ) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.patient', 'patient')
      .where('user.role = :role', { role: UserRole.PATIENT });

    if (filters?.full_name?.trim()) {
      qb.andWhere('user.full_name LIKE :full_name', {
        full_name: `%${filters.full_name.trim()}%`,
      });
    }

    if (filters?.phone?.trim()) {
      qb.andWhere('user.phone LIKE :phone', {
        phone: `%${filters.phone.trim()}%`,
      });
    }

    const skip = (page - 1) * limit;
    qb.orderBy('user.id', 'DESC').skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users.map((user) =>
        toPatientMeResponse(user, user.patient ?? null),
      ),
      total,
      currentPage: page,
      lastPage: Math.ceil(total / limit),
    };
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
}
