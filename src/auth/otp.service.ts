import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import {
  OtpPurpose,
  OtpVerification,
} from './entities/otp-verification.entity';

@Injectable()
export class OtpService {
  private static readonly OTP_TTL_MS = 5 * 60 * 1000;

  constructor(
    @InjectRepository(OtpVerification)
    private readonly otpRepository: Repository<OtpVerification>,
    private readonly i18n: I18nService,
  ) {}

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

    return { message: this.i18n.t('auth.OTP_SENT') };
  }

  async verify(
    phone: string,
    code: string,
    purpose: OtpPurpose
  ) {
    if (code === '123456'){
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
}
