import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { multerUploadConfig } from './config/multer.config';
import { toStorageUrl } from './utils/storage-url.util';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from '../users/enums/user-roles.enum';
import { I18nService } from 'nestjs-i18n';

@ApiTags('Storage')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  @Post('me/profile-picture')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Upload a profile picture for the logged-in user',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerUploadConfig))
  async uploadOwnImage(
    @CurrentUser() currentUser: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('storage.USER_NOT_FOUND'));
    }

    user.image_path = file?.filename ?? null;
    await this.userRepository.save(user);

    return {
      message: file
        ? this.i18n.t('storage.PROFILE_UPDATED')
        : this.i18n.t('storage.PROFILE_REMOVED'),
      image_path: toStorageUrl(user.image_path),
    };
  }

  @Post(':userId/profile-picture')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    description: 'Admin: Upload a profile picture for a specific user',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerUploadConfig))
  async uploadUserImageByAdmin(
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(this.i18n.t('storage.FILE_REQUIRED'));
    }
    
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('storage.USER_NOT_FOUND_WITH_ID', { args: { userId } }),
      );
    }

    user.image_path = file.filename;
    await this.userRepository.save(user);

    return {
      message: this.i18n.t('storage.PROFILE_UPDATED_FOR_USER', {
        args: { userId },
      }),
      image_path: toStorageUrl(user.image_path),
    };
  }
  
  @Roles(UserRole.ADMIN)
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    description: 'Admin: Upload an image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerUploadConfig))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(this.i18n.t('storage.FILE_REQUIRED'));
    }
    const imagePath = file.filename;
    return {
      message: this.i18n.t('storage.IMAGE_UPLOADED'),
      imagePath: imagePath,
    };
  }
}
