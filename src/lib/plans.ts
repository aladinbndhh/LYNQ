/**
 * Plan metadata — safe to import on client and server.
 * Prices are NOT hardcoded here; they are fetched live from Stripe
 * via GET /api/billing/plans so they always match the Stripe dashboard.
 */

export const PLANS = {
  solo: {
    name: 'Solo',
    description: 'Perfect for individuals and freelancers',
    priceId: process.env.STRIPE_SOLO_PRICE_ID as string | undefined,
    perUser: false,
    maxUsers: 1,
    aiChats: 500,
    profiles: 3,
    features: [
      '1 user',
      '3 digital cards',
      '500 AI chats / month',
      'Custom branding & themes',
      'Email signature builder',
      'Advanced analytics',
      'QR code + NFC support',
      'Priority support',
    ],
  },
  business: {
    name: 'Business',
    description: 'For teams — billed per active user',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID as string | undefined,
    perUser: true,
    maxUsers: -1,
    aiChats: -1,
    profiles: -1,
    features: [
      'Unlimited users (pay per seat)',
      'Unlimited digital cards',
      'Unlimited AI chats',
      'Custom domain',
      'White-label option',
      'Team analytics dashboard',
      'Odoo CRM sync',
      'API access',
      'Dedicated support',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
