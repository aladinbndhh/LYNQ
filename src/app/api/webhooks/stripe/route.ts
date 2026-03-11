import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';
import { stripe } from '@/lib/stripe';

/** Derive the update payload for a tenant from plan + userCount */
function buildPlanUpdate(plan: string, userCount: number) {
  switch (plan) {
    case 'solo':
      return {
        subscriptionTier: 'solo' as const,
        userCount: 1,
        aiUsageLimit: 500,
      };
    case 'business':
      return {
        subscriptionTier: 'business' as const,
        userCount: Math.max(userCount, 2),
        aiUsageLimit: -1, // unlimited
      };
    default:
      return null;
  }
}

/** Downgrade a tenant back to free when subscription ends/fails */
const FREE_DOWNGRADE = {
  subscriptionTier: 'free' as const,
  userCount: 1,
  aiUsageLimit: 50,
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

      // ── Payment succeeded → activate plan ──────────────────────────────────
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session;
        const tenantId = cs.metadata?.tenantId;
        const plan = cs.metadata?.plan;
        const userCount = parseInt(cs.metadata?.userCount ?? '1', 10);

        if (tenantId && plan) {
          const update = buildPlanUpdate(plan, userCount);
          if (update) {
            await Tenant.findByIdAndUpdate(tenantId, {
              ...update,
              stripeCustomerId: cs.customer as string,
              stripeSubscriptionId: cs.subscription as string,
            });
            console.log(`✅ Tenant ${tenantId} upgraded to ${plan} (${userCount} users)`);
          }
        }
        break;
      }

      // ── Subscription quantity changed (e.g. user adds seats) ────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenantId;
        const plan = sub.metadata?.plan;
        // Quantity comes from the line item for per-user plans
        const quantity = sub.items.data[0]?.quantity ?? 1;

        if (tenantId) {
          if (sub.status === 'active' && plan) {
            const update = buildPlanUpdate(plan, quantity);
            if (update) {
              await Tenant.findByIdAndUpdate(tenantId, update);
              console.log(`🔄 Tenant ${tenantId} subscription updated: ${plan} × ${quantity}`);
            }
          } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
            await Tenant.findByIdAndUpdate(tenantId, FREE_DOWNGRADE);
            console.log(`⚠️ Tenant ${tenantId} downgraded to free (payment issue)`);
          }
        }
        break;
      }

      // ── Subscription cancelled → downgrade ────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenantId;

        if (tenantId) {
          await Tenant.findByIdAndUpdate(tenantId, {
            ...FREE_DOWNGRADE,
            stripeSubscriptionId: null,
          });
          console.log(`❌ Tenant ${tenantId} subscription cancelled → free`);
        }
        break;
      }

      // ── Invoice paid (monthly renewal) ────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = invoice.subscription
          ? await stripe.subscriptions.retrieve(invoice.subscription as string)
          : null;

        if (sub) {
          const tenantId = sub.metadata?.tenantId;
          const plan = sub.metadata?.plan;
          const quantity = sub.items.data[0]?.quantity ?? 1;

          if (tenantId && plan) {
            const update = buildPlanUpdate(plan, quantity);
            if (update) {
              await Tenant.findByIdAndUpdate(tenantId, update);
            }
          }
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
