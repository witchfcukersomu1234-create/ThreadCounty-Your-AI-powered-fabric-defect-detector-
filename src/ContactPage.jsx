import React, { useState } from 'react';
import { Building2, ChevronDown, Mail, MapPin, Phone, Send, TimerReset } from 'lucide-react';

const faqs = [
  {
    question: 'What does ThreadCounty AI help textile teams do?',
    answer: 'ThreadCounty AI helps teams analyze fabric images, identify defects, review scan history, and present quality insights in a modern workflow.',
  },
  {
    question: 'Can I use this platform for student demonstrations?',
    answer: 'Yes. The platform is well suited for hackathons, academic showcases, pilot programs, and proof-of-concept textile inspection demos.',
  },
  {
    question: 'Do enterprise plans support custom deployments?',
    answer: 'The enterprise presentation tier highlights custom deployment paths, dedicated infrastructure, and tailored support for larger operations.',
  },
  {
    question: 'Will there be API and analytics features later?',
    answer: 'Yes. The pricing presentation includes future-facing API access, analytics dashboards, and advanced reporting for professional users.',
  },
  {
    question: 'How can I reach the team for a live walkthrough?',
    answer: 'Use the contact form on this page or the support details card to request a walkthrough, partnership discussion, or product overview.',
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="flex-1 bg-background texture-bg">
      <section className="relative overflow-hidden px-gutter pt-24 pb-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,176,203,0.12),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(0,220,229,0.14),transparent_32%)]" />
        <div className="relative max-w-container-max mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-steel-border bg-surface-container/50 px-4 py-2 text-primary">
            <Building2 size={16} />
            <span className="font-label-sm text-label-sm uppercase tracking-widest">Contact ThreadCounty AI</span>
          </div>
          <h1 className="mt-6 font-display-lg text-display-lg text-on-surface">
            Let&apos;s Talk About Intelligent Fabric Inspection
          </h1>
          <p className="mx-auto mt-5 max-w-3xl font-body-md text-body-md text-on-surface-variant text-lg leading-relaxed">
            Reach out for demo requests, partnerships, support conversations, or hackathon presentation walkthroughs.
          </p>
        </div>
      </section>

      <section className="px-gutter pb-16">
        <div className="max-w-container-max mx-auto grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] bg-gradient-to-b from-white/15 via-white/5 to-transparent p-[1px]">
            <div className="glass-panel rounded-[27px] p-8">
              <h2 className="font-headline-lg-mobile text-2xl text-on-surface">Send Us a Message</h2>
              <p className="mt-2 text-on-surface-variant">This form is presentation-only and does not submit to a backend.</p>

              <form className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-on-surface-variant">Name</span>
                    <input type="text" placeholder="Your name" className="w-full rounded-2xl border border-steel-border bg-surface-container px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/50" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-on-surface-variant">Email</span>
                    <input type="email" placeholder="you@example.com" className="w-full rounded-2xl border border-steel-border bg-surface-container px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/50" />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-on-surface-variant">Subject</span>
                  <input type="text" placeholder="How can we help?" className="w-full rounded-2xl border border-steel-border bg-surface-container px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/50" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-on-surface-variant">Message</span>
                  <textarea rows="6" placeholder="Tell us about your use case, team, or presentation needs." className="w-full rounded-2xl border border-steel-border bg-surface-container px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/50" />
                </label>

                <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/15 px-6 py-3 font-label-sm font-semibold text-primary transition-colors hover:bg-primary/25">
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[28px] bg-gradient-to-b from-primary/30 via-white/10 to-transparent p-[1px]">
              <div className="glass-panel rounded-[27px] p-8">
                <h2 className="font-headline-lg-mobile text-2xl text-on-surface">ThreadCounty AI</h2>
                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <Mail className="mt-1 text-tertiary" size={18} />
                    <div>
                      <div className="text-sm text-on-surface-variant">Email</div>
                      <div className="text-on-surface">support@threadcounty.ai</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="mt-1 text-primary" size={18} />
                    <div>
                      <div className="text-sm text-on-surface-variant">Phone</div>
                      <div className="text-on-surface">+91 9876543210</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="mt-1 text-[#D84D8A]" size={18} />
                    <div>
                      <div className="text-sm text-on-surface-variant">Location</div>
                      <div className="text-on-surface">Kolhapur, Maharashtra, India</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <TimerReset className="mt-1 text-secondary" size={18} />
                    <div>
                      <div className="text-sm text-on-surface-variant">Working Hours</div>
                      <div className="text-on-surface">Mon-Sat</div>
                      <div className="text-on-surface">9AM-6PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-8">
              <h3 className="font-headline-lg-mobile text-2xl text-on-surface">Interactive Map Coming Soon</h3>
              <p className="mt-3 text-on-surface-variant">
                A richer location experience will be added in a future release for customer visits and regional presence.
              </p>
              <div className="mt-6 h-56 rounded-[24px] border border-dashed border-steel-border bg-surface-container/60" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-gutter pb-24">
        <div className="max-w-container-max mx-auto">
          <div className="mb-10 text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Frequently Asked Questions</h2>
            <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">
              Common questions for demo viewers, hackathon judges, and future customers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question} className="rounded-[24px] bg-gradient-to-b from-white/15 via-white/5 to-transparent p-[1px]">
                  <div className="glass-panel rounded-[23px]">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-headline-lg-mobile text-xl text-on-surface">{faq.question}</span>
                      <ChevronDown className={`shrink-0 text-tertiary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-on-surface-variant">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
