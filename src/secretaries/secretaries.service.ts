import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateSecretaryDto } from './dto/create-secretary.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/users/entities/user.entity';
import { ConflictException } from '@nestjs/common';
import { Secretary } from './entities/secretary.entity';
import { UpdateSecretaryDto } from './dto/update-secretary.dto';
import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Injectable()
export class SecretariesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Secretary)
    private secretaryRepository: Repository<Secretary>,
  ) {}

  async createSecretary(dto: CreateSecretaryDto) {
    const existing = await this.userRepository.findOne({
      where: [{ phone: dto.phone }],
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
      username: dto.username,
      phone: dto.phone,
      password: hashedPassword,
      role: UserRole.SECRETARY,
    });

    const savedUser = await this.userRepository.save(user);

    const secretary = this.secretaryRepository.create({
      user: savedUser,
      shift_start: dto.shift_start,
      shift_end: dto.shift_end,
    });

    await this.secretaryRepository.save(secretary);
    return {
      message: 'Secretary created successfully',
      user_id: savedUser.id,
    };
  }

  async updateSecretary(id: number, updateData: UpdateSecretaryDto) {
    const secretary = await this.secretaryRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!secretary) {
      throw new NotFoundException('السكرتير غير موجود');
    }
    if (updateData.full_name !== undefined) {
      secretary.user.full_name = updateData.full_name;
    }
    if (updateData.username !== undefined) {
      secretary.user.username = updateData.username;
    }

    if (updateData.shift_start !== undefined) {
      secretary.shift_start = updateData.shift_start;
    }
    if (updateData.shift_end !== undefined) {
      secretary.shift_end = updateData.shift_end;
    }

    return await this.secretaryRepository.save(secretary);
  }

  async sendOTP(phone: string) {
    const user = await this.userRepository.findOne({
      where: { phone: phone, role: UserRole.SECRETARY },
    });

    if (!user) {
      throw new NotFoundException('Secretary not found');
    }

    user.is_verified = false;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await this.userRepository.save(user);

    // إرسال واتساب بعدين بس تزبط معنا
    console.log('OTP:', otp);

    return {
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(phone: string, otp: string) {
    const user = await this.userRepository.findOne({
      where: { phone, role: UserRole.SECRETARY },
    });

    if (!user) {
      throw new NotFoundException('Secretary not found');
    }

    if (user.otp_code !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otp_expires_at === null || user.otp_expires_at < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    user.is_verified = true;
    await this.userRepository.save(user);
    return {
      message: 'OTP verified',
    };
  }

  async resetPassword(phone: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { phone, role: UserRole.SECRETARY },
    });

    if (!user) {
      throw new NotFoundException('Secretary not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp_code = null;
    user.otp_expires_at = null;
    await this.userRepository.save(user);
    return {
      message: 'Password updated successfully',
    };
  }
}
