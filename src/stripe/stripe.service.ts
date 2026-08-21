import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  Appointment,
  DEPOSIT_AMOUNT,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';
import { I18nService } from 'nestjs-i18n';
import { AppointmentWhatsappNotifierService } from 'src/whatsapp/appointment-whatsapp-notifier.service';

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private readonly i18n: I18nService,
    private readonly appointmentWhatsappNotifier: AppointmentWhatsappNotifierService,
  ) {
    this.stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
      apiVersion: '2026-07-29.dahlia',
    });
  }

  async createCheckoutSession(
    appointmentId: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        metadata: {
          appointmentId: String(appointmentId),
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'عربون حجز موعد - عيادة Oxygen',
                description: `دفع عربون لتثبيت الموعد رقم ${appointmentId}`,
              },
              unit_amount: DEPOSIT_AMOUNT * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return { url: session.url };
    } catch (error) {
      console.error('Stripe Session Error:', error);
      throw new InternalServerErrorException(
        this.i18n.t('stripe.CHECKOUT_ERROR'),
      );
    }
  }

  async updateAppointmentStatusById(
    appointmentId: number,
    status: PaymentStatus,
    paymentIntentId?: string,
  ) {
    const existing = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    const updateData: any = {
      payment_status: status,
      ...(status === PaymentStatus.DEPOSIT_PAID
        ? { collected_amount: DEPOSIT_AMOUNT, deposit_amount: DEPOSIT_AMOUNT }
        : {}),
    };

    if (paymentIntentId) {
      updateData.stripe_payment_intent_id = paymentIntentId;
    }

    await this.appointmentRepository.update({ id: appointmentId }, updateData);

    if (status === PaymentStatus.DEPOSIT_PAID && existing) {
      const appointment = await this.findAppointmentForNotification(appointmentId);
      if (appointment) {
        void this.appointmentWhatsappNotifier.notifyPaymentStatus(
          appointment,
          existing.payment_status,
          status,
        );
      }
    }
  }

  private async findAppointmentForNotification(appointmentId: number) {
    return this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });
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

  async getPaymentStatus(appointmentId: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException(
        this.i18n.t('stripe.APPOINTMENT_NOT_FOUND'),
      );
    }

    return {
      appointmentId: appointment.id,
      paymentStatus: appointment.payment_status,
    };
  }

  async refundAppointmentDeposit(appointmentId: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException(
        this.i18n.t('stripe.APPOINTMENT_NOT_FOUND'),
      );
    }

    if (!appointment.stripe_payment_intent_id) {
      throw new BadRequestException(
        this.i18n.t('stripe.NO_PAYMENT_TO_REFUND'),
      );
    }

    try {
      await this.stripe.refunds.create({
        payment_intent: appointment.stripe_payment_intent_id,
      });

      await this.appointmentRepository.update(
        { id: appointmentId },
        {
          payment_status: PaymentStatus.REFUNDED,
          collected_amount: 0,
        },
      );

      const updatedAppointment =
        await this.findAppointmentForNotification(appointmentId);
      if (updatedAppointment) {
        void this.appointmentWhatsappNotifier.notifyPaymentStatus(
          updatedAppointment,
          appointment.payment_status,
          PaymentStatus.REFUNDED,
        );
      }

      return {
        success: true,
        message: this.i18n.t('stripe.REFUND_SUCCESS'),
      };
    } catch (error) {
      console.error('Refund Error:', error);
      throw new InternalServerErrorException(
        this.i18n.t('stripe.REFUND_ERROR'),
      );
    }
  }
}
