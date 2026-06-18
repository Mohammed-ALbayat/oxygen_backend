import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AdminMeResponseDto } from './dto/admin-me-response.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getMe(user: User): Promise<AdminMeResponseDto> {
    const adminUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!adminUser) {
      throw new NotFoundException('المسؤول غير موجود');
    }

    const response = new AdminMeResponseDto();
    response.id = adminUser.id;
    response.full_name = adminUser.full_name;
    response.phone = adminUser.phone;
    response.birth_date = adminUser.birth_date;
    response.gender = adminUser.gender;
    response.image_path = adminUser.image_path;

    return response;
  }
}
