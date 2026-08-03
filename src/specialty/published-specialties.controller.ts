import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { PublishedSpecialtyDto } from './dto/published-specialty.dto';
import { SpecialtyService } from './specialty.service';

@ApiTags('Specialties')
@ApiBearerAuth()
@Controller('specialties')
@UseGuards(JwtAuthGuard)
export class PublishedSpecialtiesController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Get('published')
  @ApiOkResponse({ type: [PublishedSpecialtyDto] })
  @ApiEndpoint('List all published medical specialties', 'authenticated')
  findAllPublished() {
    return this.specialtyService.findAllPublished();
  }
}
