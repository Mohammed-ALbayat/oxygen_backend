import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(user);
  }

  async blockUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = UserStatus.BLOCKED;
    return this.userRepository.save(user);
  }

  async unblockUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async togglestatus(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status =
      user.status === UserStatus.ACTIVE
        ? UserStatus.INACTIVE
        : UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    return this.userRepository.save(user);
  }

  async getAllUsers() {
    return this.userRepository.find();
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserByFullName(full_name: string) {
    return this.userRepository.findOne({ where: { full_name } });
  }

  async getUserByPhone(phone: string) {
    return this.userRepository.findOne({ where: { phone } });
  }

  async getUsersByRole(role: UserRole) {
    return this.userRepository.find({ where: { role } });
  }

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const qb = this.userRepository.createQueryBuilder('user');

    if (query.full_name?.trim()) {
      qb.andWhere('user.full_name LIKE :full_name', {
        full_name: `%${query.full_name.trim()}%`,
      });
    }

    if (query.phone?.trim()) {
      qb.andWhere('user.phone LIKE :phone', {
        phone: `%${query.phone.trim()}%`,
      });
    }

    if (query.role?.trim()) {
      qb.andWhere('user.role = :role', {
        role: query.role.trim(),
      });
    }

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      currentPage: page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
