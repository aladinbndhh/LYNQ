'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Sparkles, ArrowRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PLANS } from '@/lib/plans';

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

export default function PricingPage() {
  const [businessUsers, setBusinessUsers] = React.useState(5);
  const businessTotal = businessUsers * PLANS.business.price;

  const faqs: FAQItem[] = [
    {
      question: 'Can I switch between Solo and Business?',
      answer: 'Yes. You can upgrade or downgrade at any time from the billing portal. Stripe prorates any difference automatically.',
    },
    {
      question: 'How does Business billing work?',
      answer: `You choose how many seats you need and pay QAR ${PLANS.business.price} per user per month. You can add or remove seats at any time.`,
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. Contact support for a full refund.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes — both plans come with a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'What calendar providers do you support?',
      answer: 'Google Calendar, Outlook / Microsoft 365, and Odoo Calendar. Business customers can request additional integrations.',
    },
    {
      question: 'Can I use my own company branding?',
      answer: 'Yes. All plans support custom branding including your company logo, primary colors, and custom themes. Business plans include a white-label option.',
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

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
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
            className="text-lg text-muted-foreground"
          >
            All prices in <span className="font-semibold text-foreground">QAR</span>. No hidden fees.
          </motion.p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">

          {/* ── Solo ───────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="relative h-full border-border hover:border-primary/50 transition-all duration-300 p-7 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1">{PLANS.solo.name}</h3>
                <p className="text-sm text-muted-foreground">{PLANS.solo.description}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-muted-foreground">QAR</span>
                  <span className="text-4xl font-bold">{PLANS.solo.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">1 user · fixed price</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {PLANS.solo.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-green-500/20 p-1 flex-shrink-0">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup?plan=solo">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                  Get Solo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </motion.div>

          {/* ── Business ───────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="relative h-full border-primary shadow-lg shadow-primary/20 scale-[1.02] p-7 flex flex-col">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1">{PLANS.business.name}</h3>
                <p className="text-sm text-muted-foreground">{PLANS.business.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-muted-foreground">QAR</span>
                  <span className="text-4xl font-bold">{PLANS.business.price}</span>
                  <span className="text-muted-foreground">/user/month</span>
                </div>
              </div>

              {/* Live calculator */}
              <div className="mb-6 p-4 bg-secondary rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Users className="w-4 h-4" />
                    <span>{businessUsers} users</span>
                  </div>
                  <span className="text-lg font-extrabold text-primary">QAR {businessTotal}/mo</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={100}
                  value={businessUsers}
                  onChange={(e) => setBusinessUsers(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2</span><span>50</span><span>100</span>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {PLANS.business.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-green-500/20 p-1 flex-shrink-0">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup?plan=business">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600">
                  Get Business
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="py-20 px-4">
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
            <Link href="/dashboard/billing">
              <Button size="lg" variant="outline">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
