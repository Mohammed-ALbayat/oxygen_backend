import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SecretariesService } from './secretaries.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateSecretaryDto } from './dto/create-secretary.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { UpdateSecretaryDto } from './dto/update-secretary.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

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
