import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  pusher: Pusher;

  constructor(private configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.getOrThrow('PUSHER_APP_ID'),
      key: this.configService.getOrThrow('PUSHER_KEY'),
      secret: this.configService.getOrThrow('PUSHER_SECRET'),
      cluster: this.configService.getOrThrow('PUSHER_CLUSTER'),
      useTLS: true,
    });
  }

  async triggerEvent(channel: string, event: string, data: any) {
    await this.pusher.trigger(channel, event, data);
  }
}
