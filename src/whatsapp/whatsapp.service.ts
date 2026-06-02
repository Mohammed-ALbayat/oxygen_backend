import { Injectable, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';

import * as qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { NotFoundException } from '@nestjs/common/exceptions';
@Injectable()
export class WhatsAppService implements OnModuleInit {
  private sock: any;
  private isConnected = false;
  private isReady = false;

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    console.log('🚀 Starting WhatsApp...');

    const { state, saveCreds } =
      await useMultiFileAuthState('./whatsapp-session');

    this.sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
    });

    // حفظ الجلسة
    this.sock.ev.on('creds.update', saveCreds);

    // الاتصال
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      console.log('📡 connection.update:', update);

      // QR
      if (qr) {
        console.log('📲 Scan QR:');
        qrcode.generate(qr, { small: true });
      }

      // OPEN
      if (connection === 'open') {
        this.isConnected = true;

        // مهم جدًا: انتظار بسيط حتى يثبت الاتصال
        setTimeout(() => {
          this.isReady = true;
          console.log('✅ WhatsApp FULLY READY');
        }, 2000);
      }

      // CLOSE
      if (connection === 'close') {
        this.isConnected = false;
        this.isReady = false;

        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log('❌ WhatsApp Disconnected');

        if (shouldReconnect) {
          console.log('🔄 Reconnecting...');
          this.connect();
        }
      }
    });
  }

  private formatPhone(phone: string) {
    // شيل الفراغات
    phone = phone.replace(/\s/g, '');

    if (phone.startsWith('09')) {
      phone = '963' + phone.substring(1);
    }
    return phone;
  }

  async sendMessage(phone: string, message: string) {
    if (!this.isConnected || !this.isReady) {
      throw new Error('WhatsApp not ready yet');
    }
    const formatted = this.formatPhone(phone);
    const [check] = await this.sock.onWhatsApp(formatted);
    if (!check?.exists) {
      throw new NotFoundException('This number is not on WhatsApp');
    }
    const jid = `${formatted}@s.whatsapp.net`;
    const res = await this.sock.sendMessage(jid, {
      text: message,
    });

    console.log('📤 Sent to:', formatted);
    return res;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      ready: this.isReady,
    };
  }
}
