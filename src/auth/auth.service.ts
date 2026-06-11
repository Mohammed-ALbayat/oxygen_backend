import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { generateToken } from './utils/jwt.util';
import { OtpService } from './otp.service';
import { OtpPurpose } from './entities/otp-verification.entity';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';
import { Patient } from 'src/patients/entities/patient.entity';
import {
  isPatientProfileCompleted,
  toPatientMeResponse,
} from 'src/patients/utils/patient-response.util';
import { toDoctorMeResponse } from 'src/doctors/utils/doctor-response.util';
import { toSecretaryMeResponse } from 'src/secretaries/utils/secretary-response.util';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Secretary } from 'src/secretaries/entities/secretary.entity';
import { toAdminMeResponse } from 'src/users/utils/admin-response.util';
import { DoctorMeResponseDto } from 'src/doctors/dto/doctor-me-response.dto';
import { SecretaryMeResponseDto } from 'src/secretaries/dto/secretary-me-response.dto';
import { AdminMeResponseDto } from 'src/users/dto/admin-me-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private otpService: OtpService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    @InjectRepository(Secretary)
    private secretaryRepository: Repository<Secretary>,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    await this.userRepository.save(user);

    const access_token = generateToken(user, user.role, this.jwtService);
    let userDetails:
      | DoctorMeResponseDto
      | SecretaryMeResponseDto
      | AdminMeResponseDto;

    if (user.role === UserRole.DOCTOR) {
      const doctorProfile = await this.doctorRepository.findOne({
        where: { user: { id: user.id } },
      });
      userDetails = toDoctorMeResponse(user, doctorProfile);
    } else if (user.role === UserRole.SECRETARY) {
      const secretaryProfile = await this.secretaryRepository.findOne({
        where: { user: { id: user.id } },
      });
      userDetails = toSecretaryMeResponse(user, secretaryProfile);
    } else if (user.role === UserRole.ADMIN) {
      userDetails = toAdminMeResponse(user);
    } else {
      throw new UnauthorizedException('دور المستخدم غير صالح أو غير مدعوم');
    }

    return {
      access_token,
      user: userDetails,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('رقم الهاتف موجود مسبقاً');
    }

    const user = this.userRepository.create({
      phone: dto.phone,
      full_name: dto.full_name,
      gender: dto.gender,
      birth_date: new Date(dto.birthdate),
      role: UserRole.PATIENT,
    });
    await this.userRepository.save(user);

    const patient = this.patientRepository.create({ user });
    await this.patientRepository.save(patient);

    return this.otpService.create(dto.phone, OtpPurpose.PATIENT_LOGIN);
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

    return this.otpService.create(phone, OtpPurpose.PATIENT_LOGIN);
  }

  async verifyOtp(phone: string, otp: string) {
    await this.otpService.verify(phone, otp, OtpPurpose.PATIENT_LOGIN);

    const user = await this.userRepository.findOne({
      where: {
        phone,
        role: UserRole.PATIENT,
      },
      relations: ['patient'],
    });

    if (!user) {
      throw new NotFoundException('المريض غير موجود');
    }

    const access_token = generateToken(user, UserRole.PATIENT, this.jwtService);

    return {
      access_token,
      patient: toPatientMeResponse(user, user.patient ?? null),
      is_profile_completed: isPatientProfileCompleted(user),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { phone: resetPasswordDto.phonenumber },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpService.verify(
      resetPasswordDto.phonenumber,
      resetPasswordDto.otp,
      OtpPurpose.PASSWORD_RESET,
    );

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.userRepository.save(user);
    return {
      message: 'Password updated successfully',
    };
  }
}
