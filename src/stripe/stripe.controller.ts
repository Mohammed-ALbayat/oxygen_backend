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

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService, private readonly adminAppointmentsService: AdminAppointmentsService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { appointmentId: number }) {
    return this.stripeService.createPaymentIntent(body.appointmentId);
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
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Raw body is missing.');
    }

    let event;
    try {
      event = await this.stripeService.verifyWebhookSignature(req.rawBody, signature);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const appointmentId = parseInt(session.metadata.appointmentId, 10);

      if (appointmentId) {
        await this.adminAppointmentsService.updateAppointmentPaymentStatus(
          appointmentId, 
          PaymentStatus.DEPOSIT_PAID
        );
        console.log(`✅ Deposit paid for Appointment ID: ${appointmentId}`);
      }
    }

    return { received: true };
  }

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
}
