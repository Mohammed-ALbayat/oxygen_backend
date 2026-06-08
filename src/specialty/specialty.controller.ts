import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiTags('Specialty')
@ApiBearerAuth()
@Controller('specialty')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Post()
  @ApiEndpoint('Create a new medical specialty/department', [UserRole.ADMIN])
  createSpecialty(@Body() dto: CreateSpecialtyDto) {
    return this.specialtyService.createSpecialty(dto);
  }

  @Patch(':id')
  @ApiEndpoint('Update specialty name or details by id', [UserRole.ADMIN])
  updateSpecialty(@Param('id') id: string, @Body() dto: UpdateSpecialtyDto) {
    return this.specialtyService.updateSpecialty(+id, dto);
  }
}
