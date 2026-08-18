import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  Appointment,
  DEPOSIT_AMOUNT,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {
    this.stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
      apiVersion: '2026-07-29.dahlia',
    });
  }

  async createPaymentIntent(appointmentId: number) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: DEPOSIT_AMOUNT * 100,
      currency: 'usd',
    });

    await this.appointmentRepository.update(appointmentId, {
      stripe_payment_intent_id: paymentIntent.id,
      deposit_amount: DEPOSIT_AMOUNT,
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  async updateAppointmentStatus(intentId: string, status: PaymentStatus) {
    await this.appointmentRepository.update(
      { stripe_payment_intent_id: intentId },
      {
        payment_status: status,
        ...(status === PaymentStatus.DEPOSIT_PAID
          ? { collected_amount: DEPOSIT_AMOUNT }
          : {}),
      },
    );
  }

  async verifyWebhookSignature(payload: Buffer, signature: string) {
    const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET);

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${(err as Error).message}`);
    }
  }

  // الدالة الجديدة التي سيستخدمها الفرونت إند لفحص حالة الدفع
  async getPaymentStatus(appointmentId: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('الموعد غير موجود');
    }

    return {
      appointmentId: appointment.id,
      paymentStatus: appointment.payment_status,
    };
  }

  async createCheckoutSession(
    appointmentId: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    const depositAmount = 10; // مبلغ العربون الثابت

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      metadata: { 
        appointmentId: appointmentId.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'عربون حجز موعد - عيادة Oxygen',
              description: `دفع عربون لتثبيت الموعد رقم ${appointmentId}`,
            },
            unit_amount: depositAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    
    return { url: session.url };
  }
}
