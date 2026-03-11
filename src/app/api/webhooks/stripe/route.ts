import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';
import { stripe } from '@/lib/stripe';

const PLAN_LIMITS: Record<string, { subscriptionTier: 'free' | 'pro' | 'enterprise'; aiUsageLimit: number }> = {
  pro: { subscriptionTier: 'pro', aiUsageLimit: 500 },
  enterprise: { subscriptionTier: 'enterprise', aiUsageLimit: 99999 },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectDB();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const tenantId = checkoutSession.metadata?.tenantId;
        const plan = checkoutSession.metadata?.plan as string;

        if (tenantId && plan && PLAN_LIMITS[plan]) {
          await Tenant.findByIdAndUpdate(tenantId, {
            ...PLAN_LIMITS[plan],
            stripeCustomerId: checkoutSession.customer as string,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;
        const plan = subscription.metadata?.plan as string;

        if (tenantId) {
          if (subscription.status === 'active' && plan && PLAN_LIMITS[plan]) {
            await Tenant.findByIdAndUpdate(tenantId, PLAN_LIMITS[plan]);
          } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
            await Tenant.findByIdAndUpdate(tenantId, {
              subscriptionTier: 'free',
              aiUsageLimit: 50,
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;

        if (tenantId) {
          await Tenant.findByIdAndUpdate(tenantId, {
            subscriptionTier: 'free',
            aiUsageLimit: 50,
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
