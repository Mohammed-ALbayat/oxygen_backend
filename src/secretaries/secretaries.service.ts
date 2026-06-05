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

    if (updateData.shift_start !== undefined) {
      secretary.shift_start = updateData.shift_start;
    }
    if (updateData.shift_end !== undefined) {
      secretary.shift_end = updateData.shift_end;
    }

    return await this.secretaryRepository.save(secretary);
  }
}
