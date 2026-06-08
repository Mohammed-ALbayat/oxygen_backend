import {
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
import { generateToken } from './utils/jwt.util';
import { OtpService } from './otp.service';
import { OtpPurpose } from './entities/otp-verification.entity';
import { ResetPasswordDto } from 'src/common/dto/reset-password.dto';
import { Patient } from 'src/patients/entities/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private otpService: OtpService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
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
    return generateToken(user, user.role, this.jwtService);
  }

  async sendOtp(phone: string) {
    return this.otpService.create(phone, OtpPurpose.PATIENT_LOGIN);
  }

  async verifyOtp(phone: string, otp: string) {
    await this.otpService.verify(phone, otp, OtpPurpose.PATIENT_LOGIN);

    let user = await this.userRepository.findOne({
      where: {
        phone,
        role: UserRole.PATIENT,
      },
      relations: ['patient'],
    });

    if (!user) {
      user = this.userRepository.create({
        phone,

        role: UserRole.PATIENT,
      });
      await this.userRepository.save(user);

      const patient = this.patientRepository.create({ user });

      await this.patientRepository.save(patient);
    }

    return generateToken(user, UserRole.PATIENT, this.jwtService);
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
