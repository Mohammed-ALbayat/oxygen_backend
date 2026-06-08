import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { User } from 'src/users/entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePatientProfileDto } from './dto/create-profile-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UpdatePatientProfileDto } from './dto/update-profile-patient.dto';
import { UserRole } from 'src/users/enums/user-roles.enum';

@Injectable()
export class AdminPatientsService {
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

    const user = this.userRepository.create({
      full_name: dto.full_name,
      phone: dto.phone,
      role: UserRole.PATIENT,
    });

    const savedUser = await this.userRepository.save(user);

    const patient = this.patientRepository.create({ user: savedUser });
    await this.patientRepository.save(patient);

    return savedUser;
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

    if (dto.birth_date !== undefined) {
      user.birth_date = dto.birth_date;
    }
    if (dto.gender !== undefined) {
      user.gender = dto.gender;
    }
    await this.userRepository.save(user);

    const patientProfile = this.patientRepository.create({
      user,
      address: dto.address,
      blood_type: dto.blood_type,
      allergies: dto.allergies,
      previous_operations: dto.previous_operations,
      chronic_diseases: dto.chronic_diseases,
      permanent_medications: dto.permanent_medications,
      tall: dto.tall,
      weight: dto.weight,
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
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.PATIENT },
    });
    if (!user) {
      throw new NotFoundException('المريض غير موجود');
    }

    let patientProfile = await this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!patientProfile) {
      throw new NotFoundException('الملف الشخصي للمريض غير موجود');
    }

    if (dto.birth_date !== undefined) {
      user.birth_date = dto.birth_date;
    }
    if (dto.gender !== undefined) {
      user.gender = dto.gender;
    }
    await this.userRepository.save(user);

    this.applyProfileUpdates(patientProfile, dto);

    return await this.patientRepository.save(patientProfile);
  }

  private applyProfileUpdates(profile: Patient, dto: UpdatePatientProfileDto) {
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
