import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Mail, Sparkles, Target, FileText, MapPin, Globe } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';
import { trackDownload } from '../utils/analytics';

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const NowAvailability = () => {
  const { data: siteDoc, loading } = useCmsDoc(CMS_DOCS.site, null);

  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat([], options);
      setLocalTime(`${formatter.format(new Date())} (UTC+5:30)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
  const resumeUrl = siteDoc?.resumeUrl || '/resume.pdf';
  const baseLocation = siteDoc?.baseLocation || 'Colombo, Sri Lanka';
  const currentFocus = siteDoc?.currentFocus || 'Building and scaling personal projects.';

  const panels = [
    {
      title: 'Now',
      icon: Sparkles,
      body: 'Active learning paths, framework research, and technical stack expansions in progress.',
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
            className="flex flex-col justify-between rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Open signal</p>
              <h3 className="mt-3 text-3xl font-bold text-text">{availability}</h3>
              <p className="mt-4 max-w-2xl leading-relaxed text-text-muted">{preferredContact}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
                >
                  <Mail size={16} />
                  Email me
                </a>
                {resumeUrl ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackDownload('resume')}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-semibold text-accent transition-transform hover:scale-[1.02]"
                  >
                    <FileText size={16} />
                    Download CV
                  </a>
                ) : null}
                {bookingUrl ? (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 text-sm font-semibold text-accent transition-transform hover:scale-[1.02]"
                  >
                    <CalendarDays size={16} />
                    Book a call
                  </a>
                ) : null}
              </div>
            </div>

            {/* Telemetry HUD Panel */}
            <div className="mt-8 border-t border-white/5 pt-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-muted mb-4">
                TRANSMISSION TERMINAL STATUS
              </p>
              <div className="grid gap-3 sm:grid-cols-2 font-mono text-[11px]">
                <div className="rounded-xl border border-white/5 bg-primary/30 p-3 flex flex-col justify-between min-h-[64px]">
                  <span className="text-text-muted uppercase tracking-wider text-[9px]">Base Location</span>
                  <span className="text-text font-bold mt-1 flex items-center gap-1 text-[11px]">
                    <MapPin size={12} className="text-accent" />
                    {baseLocation}
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-primary/30 p-3 flex flex-col justify-between min-h-[64px]">
                  <span className="text-text-muted uppercase tracking-wider text-[9px]">Local Orbit Time</span>
                  <span className="text-text font-bold mt-1 font-mono text-[10px] animate-pulse">{localTime || 'Syncing...'}</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-primary/30 p-3 flex flex-col justify-between min-h-[64px]">
                  <span className="text-text-muted uppercase tracking-wider text-[9px]">Current Focus</span>
                  <span className="text-text font-bold mt-1 flex items-center gap-1.5 text-[11px]">
                    <Globe size={12} className="text-accent" />
                    {currentFocus}
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-primary/30 p-3 flex flex-col justify-between min-h-[64px]">
                  <span className="text-text-muted uppercase tracking-wider text-[9px]">Response SLA</span>
                  <span className="text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <Clock size={12} className="text-emerald-400" />
                    {responseSla.replace('Usually replies within ', '')}
                  </span>
                </div>
              </div>
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
