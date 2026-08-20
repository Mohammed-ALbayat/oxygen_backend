import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AdminMeResponseDto } from './dto/admin-me-response.dto';
import { toAdminMeResponse } from 'src/users/utils/admin-response.util';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  async getMe(user: User): Promise<AdminMeResponseDto> {
    const adminUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!adminUser) {
      throw new NotFoundException(this.i18n.t('admin.ADMIN_NOT_FOUND'));
    }

    return toAdminMeResponse(adminUser)!;
  }
}
