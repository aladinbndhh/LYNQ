import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';
import { requireAuth } from '@/lib/middleware/auth';
import { errorResponse, unauthorizedResponse } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);

    const { plan, userCount } = await request.json() as { plan: PlanKey; userCount?: number };

    if (!plan || plan === ('free' as any)) {
      return errorResponse('Invalid plan selected', 400);
    }

    const planData = PLANS[plan];
    if (!planData.priceId) {
      return errorResponse('Plan not configured. Please set the Stripe Price ID in environment variables.', 400);
    }

    // For business plan, quantity = number of users (min 2)
    const quantity = planData.perUser ? Math.max(userCount ?? 2, 2) : 1;

    const tenant = await Tenant.findById(session.tenantId);
    if (!tenant) return errorResponse('Tenant not found', 404);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create or retrieve Stripe customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.email,
        name: tenant.name,
        metadata: { tenantId: tenant._id.toString() },
      });
      customerId = customer.id;
      await Tenant.findByIdAndUpdate(tenant._id, { stripeCustomerId: customerId });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      currency: 'qar',
      line_items: [
        {
          price: planData.priceId,
          quantity,
        },
      ],
      success_url: `${appUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?cancelled=true`,
      // Pass plan + userCount so webhook can update MongoDB correctly
      metadata: {
        tenantId: tenant._id.toString(),
        plan,
        userCount: String(quantity),
      },
      subscription_data: {
        metadata: {
          tenantId: tenant._id.toString(),
          plan,
          userCount: String(quantity),
        },
      },
      // Allow quantity adjustments for business plan in the Stripe checkout UI
      ...(planData.perUser && {
        allow_promotion_codes: true,
      }),
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    console.error('Stripe checkout error:', error);
    return errorResponse(error.message || 'Failed to create checkout session', 500);
  }
}
