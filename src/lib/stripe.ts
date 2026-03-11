import 'server-only';
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
  typescript: true,
});

// Re-export from plans.ts so existing server-side imports of PLANS still work
export { PLANS, type PlanKey } from './plans';
