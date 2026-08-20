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

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private readonly i18n: I18nService,
  ) {
    // استخدمنا String() لتجنب خطأ undefined في TypeScript
    this.stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
      apiVersion: '2026-07-29.dahlia',
    });
  }

  // 1. إنشاء جلسة الدفع (Checkout Session) للفرونت إند
  async createCheckoutSession(
    appointmentId: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        metadata: {
          appointmentId: String(appointmentId), // إخفاء رقم الموعد ليقرأه الويب هوك
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'عربون حجز موعد - عيادة Oxygen',
                description: `دفع عربون لتثبيت الموعد رقم ${appointmentId}`,
              },
              unit_amount: DEPOSIT_AMOUNT * 100, // استخدام الثابت (يجب ضربه بـ 100 للسنتات)
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // نعيد الرابط الذي طلبه مطور الفرونت إند ليفتحه في الـ WebView
      return { url: session.url };
    } catch (error) {
      console.error('Stripe Session Error:', error);
      throw new InternalServerErrorException(
        this.i18n.t('stripe.CHECKOUT_ERROR'),
      );
    }
  }

  // 2. تحديث حالة الموعد (يستدعيها الويب هوك بناءً على الـ ID)
  async updateAppointmentStatusById(
    appointmentId: number,
    status: PaymentStatus,
    paymentIntentId?: string, // 👈 تمت الإضافة: معامل اختياري لاستقبال رقم العملية من الويب هوك
  ) {
    const updateData: any = {
      payment_status: status,
      ...(status === PaymentStatus.DEPOSIT_PAID
        ? { collected_amount: DEPOSIT_AMOUNT, deposit_amount: DEPOSIT_AMOUNT }
        : {}),
    };

    // 👈 تمت الإضافة: إذا أرسلنا رقم العملية، يتم حفظه في الداتا بيز
    if (paymentIntentId) {
      updateData.stripe_payment_intent_id = paymentIntentId;
    }

    await this.appointmentRepository.update(
      { id: appointmentId }, // البحث باستخدام ID الموعد مباشرة
      updateData,
    );
  }

  // 3. التحقق من التوقيع الأمني للويب هوك
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

  // 4. الدالة التي يستخدمها الفرونت إند لفحص حالة الدفع بعد العودة للتطبيق
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

  // 5. 👈 تمت الإضافة: دالة إرجاع العربون (Refund)
  async refundAppointmentDeposit(appointmentId: number) {
    // نبحث عن الموعد في الداتا بيز
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException(
        this.i18n.t('stripe.APPOINTMENT_NOT_FOUND'),
      );
    }

    // نتأكد أن الموعد مدفوع وله Payment Intent محفوظ
    if (!appointment.stripe_payment_intent_id) {
      throw new BadRequestException(
        this.i18n.t('stripe.NO_PAYMENT_TO_REFUND'),
      );
    }

    try {
      // نطلب من سترايب إرجاع المبلغ باستخدام الـ Intent المحفوظ
      await this.stripe.refunds.create({
        payment_intent: appointment.stripe_payment_intent_id,
      });

      // نحدث حالة الموعد في الداتا بيز (تأكد من وجود حالة REFUNDED في PaymentStatus)
      await this.appointmentRepository.update(
        { id: appointmentId },
        {
          payment_status: PaymentStatus.REFUNDED,
          collected_amount: 0, // تصفير المبلغ لأنه رجع
        },
      );

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
