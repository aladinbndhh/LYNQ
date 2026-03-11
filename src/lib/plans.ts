/**
 * Plan definitions — safe to import from both server and client components.
 * The priceId values are read server-side only (they're undefined in the browser,
 * but the billing page only uses name/price/features).
 */
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null as string | null | undefined,
    profiles: 1,
    aiChats: 50,
    features: ['1 digital card', '50 AI chats/month', 'Basic analytics', 'QR code generation'],
  },
  pro: {
    name: 'Pro',
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID as string | undefined,
    profiles: 5,
    aiChats: 500,
    features: [
      '5 digital cards',
      '500 AI chats/month',
      'Custom branding & themes',
      'Email signature builder',
      'Advanced analytics',
      'Calendar integrations',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 49,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID as string | undefined,
    profiles: -1,
    aiChats: -1,
    features: [
      'Unlimited digital cards',
      'Unlimited AI chats',
      'Custom domain',
      'Odoo CRM sync',
      'White-label option',
      'API access',
      'Dedicated support',
    ],
  },
};

export type PlanKey = keyof typeof PLANS;
