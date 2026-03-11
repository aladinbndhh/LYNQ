'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Sparkles, ArrowRight, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { StripePlanData } from '@/app/api/billing/plans/route';

interface FAQItem { question: string; answer: string; }

const FAQItemComponent: React.FC<{ item: FAQItem; index: number }> = ({ item, index }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
      className={cn('group rounded-lg transition-all duration-200 border border-border/50', isOpen ? 'bg-muted/50' : 'hover:bg-muted/30')}
    >
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-4 text-left flex items-center justify-between">
        <h3 className={cn('text-base font-medium', isOpen && 'text-foreground')}>{item.question}</h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className={cn('flex-shrink-0', isOpen ? 'text-primary' : 'text-muted-foreground')}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
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
  const [plans, setPlans] = React.useState<StripePlanData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [businessUsers, setBusinessUsers] = React.useState(5);

  React.useEffect(() => {
    fetch('/api/billing/plans')
      .then((r) => r.json())
      .then((d) => { if (d.plans) setPlans(d.plans); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const solo = plans.find((p) => p.key === 'solo');
  const business = plans.find((p) => p.key === 'business');
  const currency = (solo?.currency ?? business?.currency ?? 'qar').toUpperCase();
  const businessTotal = business ? business.displayAmount * businessUsers : 0;

  const fmt = (n: number) => `${currency} ${n.toLocaleString()}`;

  const faqs: FAQItem[] = [
    { question: 'Can I switch between Solo and Business?', answer: 'Yes. Upgrade or downgrade at any time from the billing portal. Stripe prorates any difference.' },
    { question: 'How does Business billing work?', answer: 'You choose how many seats you need. Each seat is billed at the per-user monthly rate shown above.' },
    { question: 'Do you offer refunds?', answer: 'We offer a 30-day money-back guarantee for all paid plans. Contact support for a full refund.' },
    { question: 'Is there a free trial?', answer: 'Yes — both plans come with a 14-day free trial. No credit card required to start.' },
    { question: 'Can I use my own company branding?', answer: 'Yes. All plans support custom branding. The Business plan includes a full white-label option.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">LynQ</Link>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/signup"><Button>Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground">
          All prices in <span className="font-semibold text-foreground">{currency}</span> · No hidden fees
        </motion.p>
      </section>

      {/* Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">

              {/* Solo */}
              {solo && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="h-full border-border hover:border-primary/50 transition-all duration-300 p-7 flex flex-col">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-1">{solo.name}</h3>
                      <p className="text-sm text-muted-foreground">{solo.description}</p>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">{currency}</span>
                        <span className="text-4xl font-bold">{solo.displayAmount.toLocaleString()}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">1 user · fixed price</p>
                    </div>
                    <div className="space-y-3 mb-8 flex-1">
                      {solo.features.map((f) => (
                        <div key={f} className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-green-500/20 p-1 flex-shrink-0"><Check className="h-3 w-3 text-green-400" /></div>
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/signup?plan=solo">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                        Get Solo <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              )}

              {/* Business */}
              {business && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="relative h-full border-primary shadow-lg shadow-primary/20 scale-[1.02] p-7 flex flex-col">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Most Popular
                    </div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-1">{business.name}</h3>
                      <p className="text-sm text-muted-foreground">{business.description}</p>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">{currency}</span>
                        <span className="text-4xl font-bold">{business.displayAmount.toLocaleString()}</span>
                        <span className="text-muted-foreground">/user/month</span>
                      </div>
                    </div>

                    {/* Live calculator */}
                    <div className="mb-6 p-4 bg-secondary rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Users className="w-4 h-4" /><span>{businessUsers} users</span>
                        </div>
                        <span className="text-lg font-extrabold text-primary">{fmt(businessTotal)}/mo</span>
                      </div>
                      <input type="range" min={2} max={100} value={businessUsers} onChange={(e) => setBusinessUsers(Number(e.target.value))} className="w-full accent-primary" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>2</span><span>50</span><span>100</span></div>
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                      {business.features.map((f) => (
                        <div key={f} className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-green-500/20 p-1 flex-shrink-0"><Check className="h-3 w-3 text-green-400" /></div>
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/signup?plan=business">
                      <Button className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600">
                        Get Business <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">Everything you need to know</p>
          </div>
          <div className="space-y-2">{faqs.map((faq, i) => <FAQItemComponent key={i} item={faq} index={i} />)}</div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg text-muted-foreground mb-8">Create your smart digital identity today</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup"><Button size="lg" className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          <Link href="/dashboard/billing"><Button size="lg" variant="outline">View Plans</Button></Link>
        </div>
      </section>
    </div>
  );
}
