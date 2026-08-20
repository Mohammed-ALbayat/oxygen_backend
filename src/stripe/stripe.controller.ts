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
import { AdminAppointmentsService } from 'src/appointments/admin-appointments.service';
import { I18nService } from 'nestjs-i18n';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly adminAppointmentsService: AdminAppointmentsService,
    private readonly i18n: I18nService,
  ) {}

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

  @Get('status/:appointmentId')
  async getPaymentStatus(@Param('appointmentId') appointmentId: string) {
    return this.stripeService.getPaymentStatus(+appointmentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    if (!signature) {
      throw new BadRequestException(
        this.i18n.t('stripe.MISSING_SIGNATURE'),
      );
    }

    if (!req.rawBody) {
      throw new BadRequestException(
        this.i18n.t('stripe.RAW_BODY_MISSING'),
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

      const appointmentId = parseInt(session.metadata.appointmentId, 10);

      const paymentIntentId = session.payment_intent;

      if (appointmentId) {
        await this.stripeService.updateAppointmentStatusById(
          appointmentId,
          PaymentStatus.DEPOSIT_PAID,
          paymentIntentId,
        );
        console.log(
          `✅ Deposit paid successfully for Appointment ID: ${appointmentId} with Intent: ${paymentIntentId}`,
        );
      }
    }

    // يجب دائماً إرجاع استجابة سريعة لـ Stripe لتأكيد الاستلام
    return { received: true };
  }

  // 4. 👈 تمت الإضافة: مسار إرجاع العربون (Refund)
  @Post('refund/:appointmentId')
  async refundAppointment(@Param('appointmentId') appointmentId: string) {
    return this.stripeService.refundAppointmentDeposit(+appointmentId);
  }
}
