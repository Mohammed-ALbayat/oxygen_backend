import { PartialType } from '@nestjs/swagger';
import { AdminCreateAppointmentDto } from './admin-create-appointment.dto';

export class UpdateAppointmentDto extends PartialType(
  AdminCreateAppointmentDto,
) {}
