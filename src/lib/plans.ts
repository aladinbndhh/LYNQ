/**
 * Plan definitions — safe to import from both server and client components.
 * priceId values are undefined in the browser but only used server-side.
 */

export const PLANS = {
  solo: {
    name: 'Solo',
    description: 'Perfect for individuals and freelancers',
    price: 19,           // fixed monthly price in QAR
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
    price: 12,           // price PER USER per month in QAR
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID as string | undefined,
    perUser: true,
    maxUsers: -1,        // unlimited
    aiChats: -1,         // unlimited
    profiles: -1,        // unlimited
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
