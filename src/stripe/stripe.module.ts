import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Appointment } from 'src/appointments/entities/appointment.entity'; // تأكد من مسار الاستيراد

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])], // <-- مهم جداً للربط
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
