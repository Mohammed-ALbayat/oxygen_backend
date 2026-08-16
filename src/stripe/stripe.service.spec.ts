import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
      apiVersion: '2024-06-20',
    });
  }
}
