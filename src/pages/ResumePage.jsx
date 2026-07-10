import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, FileText, Calendar, Briefcase, Mail, Printer,
  MapPin, ExternalLink, Github, Linkedin, ArrowRight,
  Code2, Award, FolderGit2, Zap, GraduationCap, Star,
} from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import PageLoader from '../components/PageLoader';
import { trackDownload } from '../utils/analytics';

const DEFAULT_RESUME_URL = '/resume.pdf';

/* ── Animated Counter ─────────────────────────────────────── */
const AnimatedCount = ({ target, suffix = '' }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(timer); }
        else setVal(start);
      }, 30);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── Stats Bar ────────────────────────────────────────────── */
const StatsBar = ({ expItems, projectCount, certCount, skillCount }) => {
  const earliestYear = expItems.reduce((acc, item) => {
    const match = String(item.period || '').match(/\d{4}/);
    if (match) { const y = parseInt(match[0]); return y < acc ? y : acc; }
    return acc;
  }, new Date().getFullYear());
  const yearsExp = new Date().getFullYear() - earliestYear;

  const stats = [
    { Icon: Briefcase,   label: 'Years Experience', value: Math.max(yearsExp, 1), suffix: '+', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
    { Icon: FolderGit2,  label: 'Projects Built',   value: projectCount,           suffix: '+', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { Icon: Award,       label: 'Certifications',   value: certCount,              suffix: '',  color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
    { Icon: Code2,       label: 'Skills',            value: skillCount,             suffix: '+', color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={`flex flex-col items-center gap-1 rounded-2xl border ${stat.border} ${stat.bg} p-4 text-center backdrop-blur-sm`}
        >
          <div className={`p-2 rounded-xl ${stat.bg} mb-1`}><stat.Icon size={18} className={stat.color} /></div>
          <span className={`text-2xl font-black font-mono ${stat.color}`}>
            <AnimatedCount target={stat.value} suffix={stat.suffix} />
          </span>
          <span className="text-[11px] text-text-muted font-mono">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

/* ── Role Type Badge ──────────────────────────────────────── */
const RoleBadge = ({ type }) => {
  const map = {
    'Full-time':  { color: 'text-emerald-300', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    'Part-time':  { color: 'text-blue-300',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
    'Internship': { color: 'text-purple-300',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
    'Freelance':  { color: 'text-amber-300',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
    'Volunteer':  { color: 'text-pink-300',    bg: 'bg-pink-400/10',    border: 'border-pink-400/20' },
  };
  const cfg = map[type] || { color: 'text-text-muted', bg: 'bg-white/5', border: 'border-white/10' };
  if (!type) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
      {type}
    </span>
  );
};

/* ── Skill Group Colours ──────────────────────────────────── */
const GROUP_COLORS = [
  'text-sky-400 border-sky-400/20 bg-sky-400/8',
  'text-purple-400 border-purple-400/20 bg-purple-400/8',
  'text-amber-400 border-amber-400/20 bg-amber-400/8',
  'text-green-400 border-green-400/20 bg-green-400/8',
  'text-pink-400 border-pink-400/20 bg-pink-400/8',
  'text-teal-400 border-teal-400/20 bg-teal-400/8',
];

/* ── Section Card Wrapper ─────────────────────────────────── */
const Card = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className={`rounded-3xl border border-white/8 bg-secondary/20 p-6 backdrop-blur-md ${className}`}
  >
    {children}
  </motion.div>
);

/* ── Card Header ──────────────────────────────────────────── */
const CardHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="p-2 rounded-xl bg-accent/10 border border-accent/20">
      {React.createElement(icon, { size: 18, className: 'text-accent' })}
    </span>
    <h2 className="text-lg font-bold text-text">{title}</h2>
  </div>
);

/* ── Main Page ────────────────────────────────────────────── */
const ResumePage = () => {
  const { data: siteDoc,        loading: siteLoading   } = useCmsDoc(CMS_DOCS.site,           null);
  const { data: experienceDoc,  loading: expLoading    } = useCmsDoc(CMS_DOCS.experience,     { items: [] });
  const { data: projectsDoc,    loading: projLoading   } = useCmsDoc(CMS_DOCS.projects,       { items: [] });
  const { data: skillsDoc,      loading: skillsLoading } = useCmsDoc(CMS_DOCS.skills,         { items: [] });
  const { data: certDoc,        loading: certLoading   } = useCmsDoc(CMS_DOCS.certifications, { items: [] });

  const loading = siteLoading || expLoading || projLoading || skillsLoading || certLoading;

  if (loading) {
    return (
      <>
        <SEO title="Resume | Sahan Pramuditha" description="Resume preview, summary, and download." canonicalPath="/resume" />
        <PageLoader text="Loading resume" subtext="Assembling CV credentials..." />
      </>
    );
  }

  /* ── Derived data ─────────────────────────────────────────── */
  const resumeUrl  = siteDoc?.resumeUrl || (import.meta.env.VITE_RESUME_URL || '').trim() || DEFAULT_RESUME_URL;
  const updatedAt  = siteDoc?.cvUpdatedAt || '—';
  const version    = siteDoc?.cvVersion   || 'v1.0';
  const email      = siteDoc?.contactEmail || siteDoc?.footerEmail || '';
  const location   = siteDoc?.baseLocation || '';

  const experienceItems = Array.isArray(experienceDoc?.items) ? experienceDoc.items : [];
  const projectItems    = (Array.isArray(projectsDoc?.items)  ? projectsDoc.items  : []).filter(p => p.status !== 'Draft');
  const skillGroups     = Array.isArray(skillsDoc?.items)     ? skillsDoc.items     : [];
  const certItems       = Array.isArray(certDoc?.items)       ? certDoc.items       : [];
  const educationItems  = Array.isArray(siteDoc?.educationJson) ? siteDoc.educationJson : [];

  const allSkillCount = skillGroups.reduce((acc, g) => {
    const skills = Array.isArray(g.skillsJson) ? g.skillsJson : [];
    return acc + skills.length;
  }, 0);

  const featuredProjects = projectItems.filter(p => p.featured).slice(0, 3);
  const displayedProjects = featuredProjects.length ? featuredProjects : projectItems.slice(0, 3);

  return (
    <>
      <SEO
        title="Resume | Sahan Pramuditha"
        description="Resume preview, professional summary, experience timeline, skills and project highlights."
        canonicalPath="/resume"
      />
      <PageShell
        eyebrow="Career Profile"
        title="Resume & Professional Summary"
        description="Download the latest CV, preview it inline, or browse a snapshot of experience, skills, and projects."
        actions={(
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              <Printer size={15} /> Print
            </button>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              <ExternalLink size={15} /> Open
            </a>
            <a
              href={resumeUrl}
              download
              onClick={() => trackDownload('resume')}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors shadow-[0_0_12px_rgb(var(--color-accent-rgb)/0.15)]"
            >
              <Download size={15} /> Download PDF
            </a>
          </>
        )}
      >
        {/* Stats Bar */}
        <StatsBar
          expItems={experienceItems}
          projectCount={projectItems.length}
          certCount={certItems.length}
          skillCount={allSkillCount}
        />

        {/* Main 2-column grid */}
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          {/* ── Left: PDF Preview ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/8 bg-secondary/20 p-4 backdrop-blur-md"
          >
            <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-primary/50 px-4 py-3 text-sm text-text-muted">
              <span className="inline-flex items-center gap-2">
                <FileText size={14} className="text-accent" />
                <span className="font-mono text-accent">Resume {version}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <Calendar size={12} className="text-accent" />
                Updated {updatedAt}
              </span>
            </div>
            <iframe
              title="Resume preview"
              src={resumeUrl}
              className="min-h-[82vh] w-full rounded-2xl border border-white/8 bg-primary"
            />
          </motion.div>

          {/* ── Right: Summary cards ───────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* 1 · Professional Summary */}
            <Card delay={0.05}>
              <CardHeader icon={Mail} title="Professional Summary" />
              <p className="text-sm leading-relaxed text-text-muted mb-4">
                {siteDoc?.heroIntro || siteDoc?.currentFocus || 'Add a professional summary in the admin panel (Website Content → heroIntro).'}
              </p>
              <div className="flex flex-wrap gap-2">
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent hover:bg-accent/20 transition-colors">
                    <Mail size={11} /> {email}
                  </a>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-text-muted">
                    <MapPin size={11} /> {location}
                  </span>
                )}
                {siteDoc?.availability && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300">
                    <Zap size={11} /> {siteDoc.availability}
                  </span>
                )}
              </div>
              {/* Social links */}
              {(siteDoc?.github || siteDoc?.linkedin) && (
                <div className="flex gap-2 mt-3">
                  {siteDoc.github && (
                    <a href={siteDoc.github} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text transition-colors">
                      <Github size={13} /> GitHub <ExternalLink size={10} />
                    </a>
                  )}
                  {siteDoc.linkedin && (
                    <a href={siteDoc.linkedin} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text transition-colors ml-3">
                      <Linkedin size={13} /> LinkedIn <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}
            </Card>

            {/* 2 · Experience Timeline */}
            {experienceItems.length > 0 && (
              <Card delay={0.1}>
                <CardHeader icon={Briefcase} title="Experience" />
                <div className="relative pl-4">
                  {/* Vertical line */}
                  <div className="absolute left-0 top-2 bottom-2 w-px bg-accent/20" />
                  <div className="space-y-4">
                    {experienceItems.slice(0, 4).map((item, i) => (
                      <motion.div
                        key={item.title || i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 + i * 0.06 }}
                        className="relative group"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[1.15rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-accent bg-primary group-hover:bg-accent transition-colors" />
                        <div className="rounded-2xl border border-white/8 bg-primary/30 p-3.5 hover:border-white/15 transition-colors">
                          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-sm text-text leading-tight">{item.title}</p>
                            <RoleBadge type={item.type} />
                          </div>
                          <p className="text-xs text-text-muted">{item.organization}</p>
                          {item.period && (
                            <p className="text-[10px] font-mono text-accent/70 mt-1">{item.period}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <a href="/#experience" className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-accent hover:underline">
                  Full timeline <ArrowRight size={12} />
                </a>
              </Card>
            )}

            {/* 3 · Skills by Category */}
            {skillGroups.length > 0 && (
              <Card delay={0.15}>
                <CardHeader icon={Code2} title="Skills" />
                <div className="space-y-3">
                  {skillGroups.slice(0, 5).map((group, gi) => {
                    const skills = (Array.isArray(group.skillsJson) ? group.skillsJson : []).slice(0, 8);
                    const colorClass = GROUP_COLORS[gi % GROUP_COLORS.length];
                    if (skills.length === 0) return null;
                    return (
                      <div key={group.title || gi}>
                        <p className={`text-[10px] font-mono font-semibold mb-1.5 ${colorClass.split(' ')[0]}`}>
                          {group.title}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s) => {
                            const name = typeof s === 'string' ? s : s?.name || '';
                            return (
                              <span key={name} className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono ${colorClass}`}>
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* 4 · Project Highlights */}
            {displayedProjects.length > 0 && (
              <Card delay={0.2}>
                <CardHeader icon={FolderGit2} title="Project Highlights" />
                <div className="space-y-3">
                  {displayedProjects.map((item, i) => (
                    <motion.div
                      key={item.title || i}
                      whileHover={{ x: 2 }}
                      className="rounded-2xl border border-white/8 bg-primary/30 p-3.5 hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-text">{item.title}</p>
                        {item.featured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-yellow-300 border border-yellow-400/20 bg-yellow-400/10 px-1.5 py-0.5 rounded-full shrink-0">
                            <Star size={8} fill="currentColor" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 mb-2">{item.shortDescription}</p>
                      {Array.isArray(item.tech) && item.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.tech.slice(0, 4).map((t) => (
                            <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-accent/15 text-accent/70 bg-accent/5">
                              {t}
                            </span>
                          ))}
                          {item.tech.length > 4 && (
                            <span className="text-[9px] font-mono text-text-muted/50">+{item.tech.length - 4}</span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {item.external && (
                          <a href={item.external} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-accent hover:underline">
                            Live demo <ExternalLink size={9} />
                          </a>
                        )}
                        {item.github && (
                          <a href={item.github} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-text-muted hover:text-text">
                            <Github size={10} /> Source
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <a href="/projects" className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-accent hover:underline">
                  All projects <ArrowRight size={12} />
                </a>
              </Card>
            )}

            {/* 5 · Education */}
            {educationItems.length > 0 && (
              <Card delay={0.25}>
                <CardHeader icon={GraduationCap} title="Education" />
                <div className="space-y-3">
                  {educationItems.map((item, i) => {
                    const initials = (item.institution || 'U').substring(0, 2).toUpperCase();
                    return (
                      <div key={item.institution || i} className="flex gap-3 items-start rounded-2xl border border-white/8 bg-primary/30 p-3.5">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-text">{item.program}</p>
                          <p className="text-xs text-text-muted">{item.institution}</p>
                          {item.period && <p className="text-[10px] font-mono text-accent/70 mt-0.5">{item.period}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ── CTA Banner ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 relative overflow-hidden rounded-3xl border border-accent/20 bg-accent/5 p-8 text-center"
        >
          {/* Glow blob */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-mono text-accent mb-2 tracking-widest uppercase">Ready to work together?</p>
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
              Let&rsquo;s build something great.
            </h2>
            <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
              Open to freelance, part-time, and select full-time roles. First reply within 1–2 business days.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={resumeUrl}
                download
                onClick={() => trackDownload('resume')}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
              >
                <Download size={15} /> Download CV
              </a>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-primary hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgb(var(--color-accent-rgb)/0.3)]"
                >
                  <Mail size={15} /> Email Me
                </a>
              )}
            </div>
          </div>
        </motion.div>

      </PageShell>
    </>
  );
};

export default ResumePage;
