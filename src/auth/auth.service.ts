import {
  BadRequestException,
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
import { I18nService } from 'nestjs-i18n';

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
    private readonly i18n: I18nService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException(
        this.i18n.t('auth.INVALID_LOGIN_CREDENTIALS'),
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException(
        this.i18n.t('auth.INVALID_LOGIN_CREDENTIALS'),
      );
    }

    await this.userRepository.save(user);

    const access_token = generateToken(user, user.role, this.jwtService);
    let userDetails:
      | DoctorMeResponseDto
      | SecretaryMeResponseDto
      | AdminMeResponseDto
      | null;

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
      throw new UnauthorizedException(
        this.i18n.t('auth.INVALID_USER_ROLE'),
      );
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
      throw new ConflictException(
        this.i18n.t('auth.PHONE_ALREADY_EXISTS'),
      );
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
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('auth.USER_NOT_FOUND_OR_NO_PHONE'),
      );
    }

    if (!user.phone?.trim()) {
      throw new BadRequestException(
        this.i18n.t('auth.USER_NO_PHONE'),
      );
    }

    return this.otpService.create(user.phone, OtpPurpose.PATIENT_LOGIN);
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
      throw new NotFoundException(
        this.i18n.t('auth.PATIENT_NOT_FOUND'),
      );
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
      throw new NotFoundException(this.i18n.t('auth.USER_NOT_FOUND'));
    }

    await this.otpService.verify(
      resetPasswordDto.phonenumber,
      resetPasswordDto.otp,
      OtpPurpose.PASSWORD_RESET,
    );

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.userRepository.save(user);
    return {
      message: this.i18n.t('auth.PASSWORD_UPDATED'),
    };
  }
}
