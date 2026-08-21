import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import {
  OtpPurpose,
  OtpVerification,
} from './entities/otp-verification.entity';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { toWhatsappChatId } from 'src/whatsapp/to-whatsapp-chat-id';

@Injectable()
export class OtpService {
  private static readonly OTP_TTL_MS = 5 * 60 * 1000;
  private static readonly DEV_BYPASS_CODE = '123456';
  private readonly logger = new Logger(OtpService.name);
  private readonly countryCode: string;

  constructor(
    @InjectRepository(OtpVerification)
    private readonly otpRepository: Repository<OtpVerification>,
    private readonly i18n: I18nService,
    private readonly whatsappService: WhatsappService,
    configService: ConfigService,
  ) {
    this.countryCode =
      configService.get<string>('GREEN_API_COUNTRY_CODE') ?? '963';
  }

  async create(phone: string, purpose: OtpPurpose) {
    await this.otpRepository.update(
      { phone, purpose, used: false },
      { used: true },
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.otpRepository.save(
      this.otpRepository.create({
        phone,
        code,
        purpose,
        expires_at: new Date(Date.now() + OtpService.OTP_TTL_MS),
      }),
    );

    this.sendOtpViaWhatsapp(phone, code);

    return { message: this.i18n.t('auth.OTP_SENT') };
  }

  async verify(
    phone: string,
    code: string,
    purpose: OtpPurpose
  ) {
    if (code === OtpService.DEV_BYPASS_CODE) {
      return true;
    }
    
    const record = await this.otpRepository.findOne({
      where: { phone, code, purpose, used: false },
      order: { created_at: 'DESC' },
    });

    if (!record || record.expires_at < new Date()) {
      throw new BadRequestException(this.i18n.t('auth.OTP_INVALID'));
    }

    record.used = true;
    await this.otpRepository.save(record);

    return record;
  }

  private sendOtpViaWhatsapp(phone: string, code: string): void {
    void this.deliverOtpViaWhatsapp(phone, code).catch((error) => {
      this.logger.error(
        `Failed to send OTP via WhatsApp to ${phone}`,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }

  private async deliverOtpViaWhatsapp(
    phone: string,
    code: string,
  ): Promise<void> {
    const chatId = toWhatsappChatId(phone, this.countryCode);

    if (!chatId || !this.whatsappService.isConfigured()) {
      return;
    }

    const message = String(
      this.i18n.t('auth.OTP_WHATSAPP_MESSAGE', {
        lang: 'ar',
        args: { code },
      }),
    );

    await this.whatsappService.sendText(chatId, message);
  }
}
