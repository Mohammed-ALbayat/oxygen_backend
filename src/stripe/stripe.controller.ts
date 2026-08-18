import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { PaymentStatus } from 'src/appointments/entities/appointment.entity';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // 1. مسار إنشاء جلسة الدفع (الذي سيستخدمه الفرونت إند)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body()
    body: {
      appointmentId: number;
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    return this.stripeService.createCheckoutSession(
      body.appointmentId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  // 2. مسار فحص حالة الدفع (يستدعيه الفرونت إند بعد عودة المريض للتطبيق)
  @Get('status/:appointmentId')
  async getPaymentStatus(@Param('appointmentId') appointmentId: string) {
    // إشارة الـ + تقوم بتحويل النص القادم من الرابط إلى رقم
    return this.stripeService.getPaymentStatus(+appointmentId);
  }

  // 3. مسار الويب هوك (تستدعيه سيرفرات Stripe تلقائياً)
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!req.rawBody) {
      throw new BadRequestException(
        'Raw body is missing. Ensure rawBody is enabled in main.ts',
      );
    }

    let event;
    try {
      event = await this.stripeService.verifyWebhookSignature(
        req.rawBody,
        signature,
      );
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    // نستمع لحدث اكتمال جلسة الـ Checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      // نستخرج رقم الموعد الذي أخفيناه في الـ metadata
      const appointmentId = parseInt(session.metadata.appointmentId, 10);

      // إذا وجدنا رقم الموعد، نقوم بتحديث حالته فوراً
      if (appointmentId) {
        await this.stripeService.updateAppointmentStatusById(
          appointmentId,
          PaymentStatus.DEPOSIT_PAID,
        );
        console.log(
          `✅ Deposit paid successfully for Appointment ID: ${appointmentId}`,
        );
      }
    }

    // يجب دائماً إرجاع استجابة سريعة لـ Stripe لتأكيد الاستلام
    return { received: true };
  }
}
