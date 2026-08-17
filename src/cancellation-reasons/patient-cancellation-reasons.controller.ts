import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { CancellationReasonsService } from './cancellation-reasons.service';
import { CancellationReasonDto } from './dto/cancellation-reason.response.dto';

@ApiTags('Cancellation Reasons Patients')
@ApiBearerAuth()
@Controller('patient/cancellation-reasons')
@Roles(UserRole.PATIENT)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientCancellationReasonsController {
  constructor(
    private readonly cancellationReasonsService: CancellationReasonsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: CancellationReasonDto, isArray: true })
  @ApiEndpoint('List the cancellation reasons a patient can choose from', [
    UserRole.PATIENT,
  ])
  findActive() {
    return this.cancellationReasonsService.findActive();
  }
}
