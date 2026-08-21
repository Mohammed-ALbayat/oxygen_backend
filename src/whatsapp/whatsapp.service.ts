import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendTextOptions {
  typingTime?: number;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly enabled: boolean;
  private readonly apiUrl: string | undefined;
  private readonly idInstance: string | undefined;
  private readonly apiToken: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.enabled =
      this.configService.get<string>('GREEN_API_ENABLED') === 'true';
    this.apiUrl = this.configService.get<string>('GREEN_API_URL');
    this.idInstance = this.configService.get<string>('GREEN_API_ID_INSTANCE');
    this.apiToken = this.configService.get<string>(
      'GREEN_API_TOKEN_INSTANCE',
    );
  }

  isConfigured(): boolean {
    return (
      this.enabled &&
      Boolean(this.apiUrl && this.idInstance && this.apiToken)
    );
  }

  async sendText(
    chatId: string,
    message: string,
    options: SendTextOptions = {},
  ): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    if (!message.trim()) {
      this.logger.warn('Skipped WhatsApp send: empty message');
      return null;
    }

    const url = `${this.apiUrl}/waInstance${this.idInstance}/sendMessage/${this.apiToken}`;
    const body = {
      chatId,
      message,
      typingTime: options.typingTime ?? 1000,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Green API sendMessage failed (${response.status}): ${errorBody}`,
      );
    }

    const data = (await response.json()) as { idMessage?: string };
    return data.idMessage ?? null;
  }
}
