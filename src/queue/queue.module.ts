import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { PusherService } from 'src/pusher/pusher.service';

import { AppointmentsModule } from 'src/appointments/appointments.module';

@Module({
  imports: [AppointmentsModule],
  providers: [PusherService],
  controllers: [QueueController],
})
export class QueueModule {}
