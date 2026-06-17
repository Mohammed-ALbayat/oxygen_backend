import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { SecretariesService } from './secretaries.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateSecretaryDto } from './dto/create-secretary.dto';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { UpdateSecretaryDto } from './dto/update-secretary.dto';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { SecretaryMeResponseDto } from './dto/secretary-me-response.dto';

@ApiTags('Secretaries')
@ApiBearerAuth()
@Controller('secretaries')
export class SecretariesController {
  constructor(private readonly secretariesService: SecretariesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiEndpoint('Create a new secretary account', [UserRole.ADMIN])
  async create(@Body() createSecretaryDto: CreateSecretaryDto) {
    return this.secretariesService.createSecretary(createSecretaryDto);
  }

  @Get('me')
  @Roles(UserRole.SECRETARY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SecretaryMeResponseDto })
  @ApiEndpoint('Get current secretary profile and account details', [
    UserRole.SECRETARY,
  ])
  getMe(@CurrentUser() user: User): Promise<SecretaryMeResponseDto> {
    return this.secretariesService.getMe(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiEndpoint('Update secretary account and shift details by id', [
    UserRole.ADMIN,
  ])
  async update(
    @Param('id') id: number,
    @Body() updateSecretaryDto: UpdateSecretaryDto,
  ) {
    return this.secretariesService.updateSecretary(id, updateSecretaryDto);
  }
}
