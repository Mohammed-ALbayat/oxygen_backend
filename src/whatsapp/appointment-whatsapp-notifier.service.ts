import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';
import { extractDateString } from 'src/appointments/utils/date.helper';
import { toWhatsappChatId } from './to-whatsapp-chat-id';
import { WhatsappService } from './whatsapp.service';

const SKIP_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.START,
  AppointmentStatus.WAITING,
  AppointmentStatus.COMPLETE,
];

@Injectable()
export class AppointmentWhatsappNotifierService {
  private readonly logger = new Logger(AppointmentWhatsappNotifierService.name);
  private readonly countryCode: string;
  private readonly language = 'ar';

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly i18n: I18nService,
    configService: ConfigService,
  ) {
    this.countryCode = configService.get<string>('GREEN_API_COUNTRY_CODE') ?? '963';
  }

  async notifyAppointmentStatus(
    appointment: Appointment,
    previousStatus: AppointmentStatus,
    nextStatus: AppointmentStatus,
  ): Promise<void> {
    if (
      previousStatus === nextStatus ||
      SKIP_APPOINTMENT_STATUSES.includes(nextStatus)
    ) {
      return;
    }

    const messageKey = `whatsapp.APPOINTMENT_STATUS_${nextStatus.toUpperCase()}`;
    await this.sendAppointmentMessage(appointment, messageKey);
  }

  async notifyAppointmentRescheduled(appointment: Appointment): Promise<void> {
    await this.sendAppointmentMessage(
      appointment,
      'whatsapp.APPOINTMENT_RESCHEDULED',
    );
  }

  async notifyPaymentStatus(
    appointment: Appointment,
    previousStatus: PaymentStatus,
    nextStatus: PaymentStatus,
  ): Promise<void> {
    if (previousStatus === nextStatus) {
      return;
    }

    const messageKey = `whatsapp.PAYMENT_STATUS_${nextStatus.toUpperCase()}`;
    await this.sendAppointmentMessage(appointment, messageKey);
  }

  private async sendAppointmentMessage(
    appointment: Appointment,
    messageKey: string,
  ): Promise<void> {
    try {
      const chatId = toWhatsappChatId(
        appointment.patient?.user?.phone,
        this.countryCode,
      );

      if (!chatId || !this.whatsappService.isConfigured()) {
        return;
      }

      const message = String(
        this.i18n.t(messageKey, {
          lang: this.language,
          args: {
            doctor: appointment.doctor?.user?.full_name ?? '',
            date: extractDateString(appointment.appointment_date),
            time: appointment.start_time,
            patient: this.firstName(appointment.patient?.user?.full_name),
          },
        }),
      );

      await this.whatsappService.sendText(chatId, message);
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp notification for appointment ${appointment.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private firstName(fullName: string | null | undefined): string {
    if (!fullName?.trim()) {
      return '';
    }

    return fullName.trim().split(/\s+/)[0] ?? '';
  }
}
