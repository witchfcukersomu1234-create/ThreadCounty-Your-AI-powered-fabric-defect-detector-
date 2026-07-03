import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Check, Cpu, Crown, Layers3, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'FREE',
    price: '₹0/month',
    icon: Sparkles,
    button: 'Current Plan',
    featured: false,
    accent: 'text-tertiary',
    features: [
      '10 AI Scans/month',
      'Basic Fabric Detection',
      'Scan History',
      'Download Reports',
    ],
  },
  {
    name: 'STUDENT',
    price: '₹199/month',
    icon: BadgeCheck,
    button: 'Coming Soon',
    featured: false,
    accent: 'text-primary',
    features: [
      '250 AI Scans',
      'Faster Analysis',
      'Priority Support',
      'PDF Reports',
      'AI Recommendations',
    ],
  },
  {
    name: 'PROFESSIONAL',
    price: '₹999/month',
    icon: Crown,
    button: 'Coming Soon',
    featured: true,
    accent: 'text-[#D84D8A]',
    features: [
      'Unlimited Scans',
      'Batch Processing',
      'Advanced Reports',
      'Analytics Dashboard',
      'API Access',
      'Priority Queue',
    ],
  },
  {
    name: 'ENTERPRISE',
    price: 'Custom Pricing',
    icon: Layers3,
    button: 'Contact Sales',
    featured: false,
    accent: 'text-secondary',
    features: [
      'Dedicated Infrastructure',
      'Team Management',
      'Unlimited Storage',
      'Admin Dashboard',
      'Dedicated Support',
      'Custom AI Models',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex-1 bg-background texture-bg">
      <section className="relative overflow-hidden px-gutter pt-24 pb-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,220,229,0.12),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(255,176,203,0.14),transparent_28%)]" />
        <div className="relative max-w-container-max mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-steel-border bg-surface-container/50 px-4 py-2 text-tertiary">
            <Cpu size={16} />
            <span className="font-label-sm text-label-sm uppercase tracking-widest">ThreadCounty Pricing</span>
          </div>
          <h1 className="mt-6 font-display-lg text-display-lg text-on-surface">
            Pricing for Every Stage of Fabric Intelligence
          </h1>
          <p className="mx-auto mt-5 max-w-3xl font-body-md text-body-md text-on-surface-variant text-lg leading-relaxed">
            Presentation-ready plans for startups, student teams, professional labs, and industrial operations.
          </p>
        </div>
      </section>

      <section className="px-gutter pb-24">
        <div className="max-w-container-max mx-auto grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`rounded-[28px] p-[1px] transition-transform duration-300 hover:-translate-y-2 ${
                  plan.featured
                    ? 'bg-gradient-to-b from-[#D84D8A] via-primary to-tertiary shadow-[0_18px_60px_rgba(216,77,138,0.18)]'
                    : 'bg-gradient-to-b from-white/15 via-white/5 to-transparent'
                }`}
              >
                <div className="glass-panel relative flex h-full flex-col rounded-[27px] p-7">
                  {plan.featured && (
                    <div className="absolute right-5 top-5 rounded-full border border-[#D84D8A]/40 bg-[#D84D8A]/15 px-3 py-1">
                      <span className="font-label-sm text-label-sm font-semibold text-[#ffb0cb]">Recommended</span>
                    </div>
                  )}

                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-steel-border bg-surface-container-highest ${plan.accent}`}>
                    <Icon size={22} />
                  </div>

                  <div className="font-label-sm text-label-sm tracking-[0.24em] text-on-surface-variant">{plan.name}</div>
                  <div className="mt-3 font-headline-lg text-3xl text-on-surface">{plan.price}</div>
                  <div className="mt-2 text-sm text-on-surface-variant">Built for polished demos and future-ready expansion.</div>

                  <div className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm text-on-surface">
                        <Check size={16} className="mt-0.5 shrink-0 text-tertiary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`mt-8 rounded-2xl border px-5 py-3 font-label-sm text-label-sm font-semibold transition-all ${
                      plan.featured
                        ? 'border-[#D84D8A]/40 bg-[#D84D8A]/15 text-on-surface hover:bg-[#D84D8A]/25'
                        : 'border-steel-border bg-surface-container text-on-surface hover:bg-white/10'
                    }`}
                  >
                    {plan.button}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-container-max mx-auto mt-12">
          <div className="glass-panel rounded-[28px] border border-steel-border px-8 py-7 text-center">
            <h2 className="font-headline-lg-mobile text-2xl text-on-surface">Need help choosing the right plan?</h2>
            <p className="mt-3 text-on-surface-variant">
              Explore the platform experience or reach out to our team for a guided walkthrough.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact" className="rounded-2xl border border-primary/40 bg-primary/15 px-6 py-3 font-label-sm font-semibold text-primary transition-colors hover:bg-primary/25">
                Contact Team
              </Link>
              <Link to="/upload" className="rounded-2xl border border-steel-border bg-surface-container px-6 py-3 font-label-sm font-semibold text-on-surface transition-colors hover:bg-white/10">
                View Product
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
