'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  aiLimit: string;
  features: PricingFeature[];
  buttonText: string;
  buttonLink: string;
  isPopular?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQItemComponent: React.FC<{ item: FAQItem; index: number }> = ({ item, index }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
      className={cn(
        'group rounded-lg transition-all duration-200 border border-border/50',
        isOpen ? 'bg-gradient-to-br from-background via-muted/50 to-background' : 'hover:bg-muted/50'
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between"
      >
        <h3 className={cn('text-base font-medium', isOpen && 'text-foreground')}>
          {item.question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn('flex-shrink-0', isOpen ? 'text-primary' : 'text-muted-foreground')}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-4 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PricingCard: React.FC<{ tier: PricingTier; isYearly: boolean; index: number }> = ({
  tier,
  isYearly,
  index,
}) => {
  const price = isYearly ? tier.yearlyPrice : tier.price;
  const savings = isYearly
    ? Math.round(((tier.price * 12 - tier.yearlyPrice) / (tier.price * 12)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className={cn(
          'relative h-full overflow-hidden border p-6 transition-all duration-300',
          tier.isPopular
            ? 'border-primary shadow-lg shadow-primary/20 scale-105'
            : 'border-border hover:border-primary/50'
        )}
      >
        {tier.isPopular && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
          <p className="text-sm text-muted-foreground">{tier.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${price}</span>
            <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
          </div>
          {isYearly && savings > 0 && (
            <p className="text-xs text-green-600 mt-1">Save {savings}% annually</p>
          )}
        </div>

        <div className="mb-6 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-foreground">{tier.aiLimit}</p>
        </div>

        <Link href={tier.buttonLink}>
          <Button
            className={cn(
              'w-full mb-6',
              tier.isPopular && 'bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600'
            )}
            variant={tier.isPopular ? 'default' : 'outline'}
          >
            {tier.buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

        <div className="space-y-3">
          {tier.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {feature.included ? (
                <div className="mt-0.5 rounded-full bg-green-100 dark:bg-green-900/30 p-1">
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="mt-0.5 rounded-full bg-muted p-1">
                  <Check className="h-3 w-3 text-muted-foreground opacity-30" />
                </div>
              )}
              <span
                className={cn(
                  'text-sm',
                  feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                )}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default function PricingPage() {
  const [isYearly, setIsYearly] = React.useState(false);

  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      description: 'Perfect for trying out LynQ',
      price: 0,
      yearlyPrice: 0,
      aiLimit: '100 AI messages/month',
      features: [
        { text: '1 digital profile', included: true },
        { text: 'QR code generation', included: true },
        { text: 'Basic AI secretary', included: true },
        { text: 'Lead capture', included: true },
        { text: 'Email signature', included: true },
        { text: 'Calendar integration', included: false },
        { text: 'Odoo integration', included: false },
        { text: 'Priority support', included: false },
      ],
      buttonText: 'Get Started Free',
      buttonLink: '/signup',
    },
    {
      name: 'Pro',
      description: 'For professionals and sales teams',
      price: 29,
      yearlyPrice: 290,
      aiLimit: '1,000 AI messages/month',
      features: [
        { text: 'Unlimited digital profiles', included: true },
        { text: 'QR code generation', included: true },
        { text: 'Advanced AI secretary', included: true },
        { text: 'Unlimited lead capture', included: true },
        { text: 'Email signatures', included: true },
        { text: 'Google & Outlook Calendar', included: true },
        { text: 'Analytics dashboard', included: true },
        { text: 'Priority email support', included: true },
      ],
      buttonText: 'Start Pro Trial',
      buttonLink: '/signup?plan=pro',
      isPopular: true,
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: 99,
      yearlyPrice: 990,
      aiLimit: 'Unlimited AI messages',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Odoo CRM integration', included: true },
        { text: 'Custom AI training', included: true },
        { text: 'White-label branding', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'API access', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 priority support', included: true },
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact',
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: 'Can I change my plan later?',
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: 'What happens if I exceed my AI usage limit?',
      answer:
        'If you exceed your monthly limit, you can upgrade to a higher tier or wait until the next billing cycle. Pro users get 1,000 messages/month, Enterprise gets unlimited.',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact support for a full refund.",
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer:
        'Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required to start your trial.',
    },
    {
      question: 'What calendar providers do you support?',
      answer:
        'We support Google Calendar, Outlook/Microsoft 365, and Odoo Calendar. Enterprise customers can request additional integrations.',
    },
    {
      question: 'Can I use my own company branding?',
      answer:
        'Yes! All plans support custom branding including your company logo badge, primary colors, and custom domains (Enterprise).',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
              LynQ
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Choose the perfect plan for your smart digital identity needs
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-12"
          >
            <span className={cn('text-sm font-medium', !isYearly && 'text-foreground')}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                isYearly ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-background transition-transform',
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span className={cn('text-sm font-medium', isYearly && 'text-foreground')}>
              Yearly
              <span className="ml-1 text-green-600 text-xs">(Save 17%)</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={tier.name} tier={tier} isYearly={isYearly} index={index} />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">Everything you need to know about LynQ pricing</p>
          </motion.div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItemComponent key={index} item={faq} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-rose-50 dark:from-indigo-950/20 dark:to-rose-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Create your smart digital identity today and start capturing leads with AI
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
