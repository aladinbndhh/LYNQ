import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/middleware/auth';
import { errorResponse, unauthorizedResponse } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);

    const tenant = await Tenant.findById(session.tenantId);
    if (!tenant) return errorResponse('Tenant not found', 404);

    if (!tenant.stripeCustomerId) {
      return errorResponse('No billing account found. Please subscribe to a plan first.', 400);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    console.error('Stripe portal error:', error);
    return errorResponse(error.message || 'Failed to open billing portal', 500);
  }
}
