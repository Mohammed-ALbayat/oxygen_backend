import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { CancellationReasonsService } from './cancellation-reasons.service';
import { CancellationReasonDto } from './dto/cancellation-reason.response.dto';
import { CreateCancellationReasonDto } from './dto/create-cancellation-reason.dto';
import { UpdateCancellationReasonStatusDto } from './dto/update-cancellation-reason-status.dto';

@ApiTags('Cancellation Reasons Admin')
@ApiBearerAuth()
@Controller('admin/cancellation-reasons')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCancellationReasonsController {
  constructor(
    private readonly cancellationReasonsService: CancellationReasonsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: CancellationReasonDto, isArray: true })
  @ApiEndpoint('List all cancellation reasons, active and inactive', [
    UserRole.ADMIN,
  ])
  findAll() {
    return this.cancellationReasonsService.findAll();
  }

  @Post()
  @ApiOkResponse({ type: CancellationReasonDto })
  @ApiEndpoint('Create a new cancellation reason', [UserRole.ADMIN])
  create(@Body() dto: CreateCancellationReasonDto) {
    return this.cancellationReasonsService.create(dto);
  }

  @Patch(':id/status')
  @ApiOkResponse({ type: CancellationReasonDto })
  @ApiEndpoint(
    'Activate or deactivate a cancellation reason. Reasons are never deleted so historical reports stay intact.',
    [UserRole.ADMIN],
  )
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCancellationReasonStatusDto,
  ) {
    return this.cancellationReasonsService.setActive(id, dto.isActive);
  }
}
