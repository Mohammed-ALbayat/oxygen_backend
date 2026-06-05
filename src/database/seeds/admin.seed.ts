import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class AdminSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    // تحقق إذا الأدمن موجود
    const existingAdmin = await this.userRepository.findOne({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = this.userRepository.create({
      full_name: 'System Admin',
      phone: '0999999999',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await this.userRepository.save(admin);

    console.log('Admin seeded successfully');
  }
}
