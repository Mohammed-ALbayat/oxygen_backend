import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AppointmentsModule } from 'src/appointments/appointments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), AppointmentsModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
