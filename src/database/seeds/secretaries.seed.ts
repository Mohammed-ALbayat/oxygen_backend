import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Secretary } from 'src/secretaries/entities/secretary.entity';

@Injectable()
export class SecretariesSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Secretary)
    private readonly secretaryRepository: Repository<Secretary>,
  ) {}

  async seed() {
    const count = await this.secretaryRepository.count();

    if (count > 0) {
      console.log('Secretaries already seeded');
      return;
    }

    const hashedPassword = await bcrypt.hash('secretary123', 10);

    for (let i = 1; i <= 5; i++) {
      // إنشاء user
      const user = this.userRepository.create({
        full_name: `Secretary ${i}`,
        phone: `099999996${i}`,
        password: hashedPassword,
        role: UserRole.SECRETARY,
      });

      const savedUser = await this.userRepository.save(user);

      // إنشاء secretary profile
      const secretary = this.secretaryRepository.create({
        user_id: savedUser.id,
        user: savedUser,
        shift_start: '08:00:00',

        shift_end: '16:00:00',
      });

      await this.secretaryRepository.save(secretary);
    }

    console.log('5 secretaries seeded successfully');
  }
}
