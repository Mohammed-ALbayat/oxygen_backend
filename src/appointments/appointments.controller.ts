import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { MessageDto } from 'src/common/dto/message.dto';
import { AppointmentsService } from './appointments.service';

@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly AppointmentsService: AppointmentsService) {}
}
