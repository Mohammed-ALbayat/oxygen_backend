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

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { appointmentId: number }) {
    return this.stripeService.createPaymentIntent(body.appointmentId);
  }

  // المسار الجديد الذي تمت إضافته لفحص حالة الدفع
  @Get('status/:appointmentId')
  async getPaymentStatus(@Param('appointmentId') appointmentId: string) {
    // إشارة الـ + تقوم بتحويل النص القادم من الرابط إلى رقم
    return this.stripeService.getPaymentStatus(+appointmentId);
  }

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
      // تمرير المتغيرين بشكل صحيح
      event = await this.stripeService.verifyWebhookSignature(
        req.rawBody,
        signature,
      );
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      await this.stripeService.updateAppointmentStatus(
        paymentIntent.id,
        PaymentStatus.DEPOSIT_PAID,
      );

      console.log(`✅ Deposit paid for Intent: ${paymentIntent.id}`);
    }

    return { received: true };
  }
}
