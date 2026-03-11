import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/api';

// GET /api/billing/status - Get current tenant billing info
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);

    const tenant = await Tenant.findById(session.tenantId).select(
      'subscriptionTier aiUsageCount aiUsageLimit stripeCustomerId name email'
    );

    if (!tenant) return errorResponse('Tenant not found', 404);

    return successResponse({
      subscriptionTier: tenant.subscriptionTier,
      aiUsageCount: tenant.aiUsageCount,
      aiUsageLimit: tenant.aiUsageLimit,
      hasStripeAccount: !!tenant.stripeCustomerId,
      name: tenant.name,
      email: tenant.email,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to fetch billing status', 500);
  }
}
