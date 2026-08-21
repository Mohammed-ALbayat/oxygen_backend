import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AppointmentWhatsappNotifierService } from './appointment-whatsapp-notifier.service';

@Module({
  providers: [WhatsappService, AppointmentWhatsappNotifierService],
  exports: [WhatsappService, AppointmentWhatsappNotifierService],
})
export class WhatsappModule {}
