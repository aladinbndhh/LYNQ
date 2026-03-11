import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

export interface StripePlanData {
  key: 'solo' | 'business';
  name: string;
  description: string;
  perUser: boolean;
  features: readonly string[];
  // From Stripe
  amount: number;        // in smallest currency unit (e.g. fils)
  currency: string;      // e.g. "qar"
  displayAmount: number; // human-readable (amount / 100)
  priceId: string;
  configured: boolean;
}

export async function GET() {
  const results: StripePlanData[] = [];

  for (const [key, plan] of Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]) {
    if (!plan.priceId) {
      results.push({
        key,
        name: plan.name,
        description: plan.description,
        perUser: plan.perUser,
        features: plan.features,
        amount: 0,
        currency: 'qar',
        displayAmount: 0,
        priceId: '',
        configured: false,
      });
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(plan.priceId);
      results.push({
        key,
        name: plan.name,
        description: plan.description,
        perUser: plan.perUser,
        features: plan.features,
        amount: price.unit_amount ?? 0,
        currency: price.currency,
        // Stripe stores amounts in smallest unit (fils for QAR → divide by 100)
        displayAmount: (price.unit_amount ?? 0) / 100,
        priceId: price.id,
        configured: true,
      });
    } catch (err) {
      console.error(`Failed to fetch Stripe price for ${key}:`, err);
      results.push({
        key,
        name: plan.name,
        description: plan.description,
        perUser: plan.perUser,
        features: plan.features,
        amount: 0,
        currency: 'qar',
        displayAmount: 0,
        priceId: plan.priceId,
        configured: false,
      });
    }
  }

  return NextResponse.json({ plans: results });
}
