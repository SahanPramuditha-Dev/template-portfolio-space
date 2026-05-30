import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Mail, Sparkles, Target } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';
import CopyEmailButton from './CopyEmailButton';

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const NowAvailability = () => {
  const { data: siteDoc, loading } = useCmsDoc(CMS_DOCS.site, null);

  if (loading || siteDoc === undefined) {
    return <CmsSectionSkeleton id="now" titleBlockClass="max-w-sm" />;
  }

  const currentLearning = asList(siteDoc?.currentLearningJson);
  const careerGoals = asList(siteDoc?.careerGoalsJson);
  const devEnvironment = asList(siteDoc?.devEnvironmentJson);
  const availability = siteDoc?.availability || 'Open to selected collaborations.';
  const preferredContact = siteDoc?.preferredContact || 'Email works best for detailed inquiries.';
  const responseSla = siteDoc?.responseSla || 'Usually replies within 1-2 business days.';
  const contactEmail = siteDoc?.contactEmail || siteDoc?.footerEmail || 'contact@sahanpramuditha.com';
  const bookingUrl = siteDoc?.bookingUrl || import.meta.env.VITE_BOOKING_URL || '';

  const panels = [
    {
      title: 'Now',
      icon: Sparkles,
      body: availability,
      items: currentLearning,
    },
    {
      title: 'Direction',
      icon: Target,
      body: 'Current growth areas and the kind of work I am aiming toward.',
      items: careerGoals,
    },
    {
      title: 'Workbench',
      icon: Clock,
      body: 'Tools and habits shaping the way I build right now.',
      items: devEnvironment,
    },
  ];

  return (
    <SectionWrapper id="now">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-xl font-bold text-text font-display gradient-text sm:text-2xl md:text-3xl">
          <span className="mr-0 font-mono text-lg text-accent sm:mr-2 sm:text-xl">02.</span>
          <span className="min-w-0 flex-grow">Now & Availability</span>
          <span className="order-3 ml-0 h-px w-full min-w-[60px] flex-grow bg-secondary opacity-50 sm:order-none sm:ml-4 sm:w-auto" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Open signal</p>
            <h3 className="mt-3 text-3xl font-bold text-text">{availability}</h3>
            <p className="mt-4 max-w-2xl leading-relaxed text-text-muted">{preferredContact}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-primary"
              >
                <Mail size={16} />
                Email me
              </a>
              <CopyEmailButton email={contactEmail} compact />
              {bookingUrl ? (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent"
                >
                  <CalendarDays size={16} />
                  Book a call
                </a>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-xl border border-secondary/40 bg-primary/40 px-5 py-3 text-sm text-text-muted">
                <Clock size={16} className="text-accent" />
                {responseSla}
              </span>
            </div>
          </motion.div>

          <div className="grid gap-5">
            {panels.map((panel, index) => {
              const Icon = panel.icon;
              return (
                <motion.article
                  key={panel.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-3xl border border-white/10 bg-secondary/20 p-5 backdrop-blur-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-xl border border-accent/20 bg-accent/10 p-2 text-accent">
                      <Icon size={18} />
                    </span>
                    <h3 className="text-lg font-bold text-text">{panel.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-text-muted">{panel.body}</p>
                  {panel.items.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {panel.items.slice(0, 6).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-accent/20 bg-primary/50 px-3 py-1 text-xs font-mono text-accent"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default NowAvailability;
