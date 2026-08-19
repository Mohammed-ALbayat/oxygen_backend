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

@ApiTags('Storage')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      throw new NotFoundException('User not found');
    }

    user.image_path = file?.filename ?? null;
    await this.userRepository.save(user);

    return {
      message: file
        ? 'Your profile picture has been updated successfully'
        : 'Your profile picture has been removed successfully',
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
      throw new BadRequestException('File is required');
    }
    
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.image_path = file.filename;
    await this.userRepository.save(user);

    return {
      message: `Profile picture for user ID ${userId} updated successfully`,
      filename: file.filename,
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
      throw new BadRequestException('File is required');
    }
    const imagePath = file.filename;
    return {
      message: `Image uploaded successfully`,
      imagePath: imagePath,
    };
  }
}
