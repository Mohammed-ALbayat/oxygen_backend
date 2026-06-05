import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { SecretariesService } from './secretaries.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateSecretaryDto } from './dto/create-secretary.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { UpdateSecretaryDto } from './dto/update-secretary.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('secretaries')
export class SecretariesController {
  constructor(private readonly secretariesService: SecretariesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSecretaryDto: CreateSecretaryDto) {
    return this.secretariesService.createSecretary(createSecretaryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: number,
    @Body() updateSecretaryDto: UpdateSecretaryDto,
  ) {
    return this.secretariesService.updateSecretary(id, updateSecretaryDto);
  }
}
