import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, ArrowRight, Star,
  Zap, ChevronDown, ChevronUp, MessageSquare, 
  Terminal, Database, Cpu, Cloud, FolderGit2,
  Code2, Layers, Server, Shield, Clock,
  Search, LayoutTemplate, Activity, Monitor, Code, X, ArrowLeft
} from 'lucide-react';
import SEO from '../components/SEO';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import SpaceWarpBackground from '../components/SpaceWarpBackground';

/* ── Animation Variants ────────────────────────────────────── */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

/* ── Icon resolver ────────────────────────────────────────── */
const ICON_MAP = {
  Monitor, Code, Database, Globe: Layers, Layers, Server, Briefcase: Code, Cpu, Cloud, BarChart2: Cpu
};

const resolveIcon = (name) => {
  if (!name) return Code;
  const lowercase = name.toLowerCase();
  if (lowercase.includes('monitor') || lowercase.includes('portfolio') || lowercase.includes('layout')) return Monitor;
  if (lowercase.includes('code') || lowercase.includes('app') || lowercase.includes('custom')) return Code;
  if (lowercase.includes('database') || lowercase.includes('backend') || lowercase.includes('api') || lowercase.includes('commerce') || lowercase.includes('store')) return Database;
  if (lowercase.includes('server')) return Server;
  if (lowercase.includes('cpu') || lowercase.includes('system')) return Cpu;
  if (lowercase.includes('cloud')) return Cloud;
  
  const resolved = ICON_MAP[name];
  return resolved || Code;
};

/* ── Default Fallback Data ────────────────────────────────── */
const DEFAULT_SERVICES = [
  {
    title: "Portfolio Website",
    startingPrice: "Rs. 30,000",
    category: "Web Development",
    icon: "Monitor",
    features: [
      "Increase customer trust",
      "Improve online visibility",
      "Establish professional brand",
      "Rank higher on Google (SEO)"
    ],
    templates: [
      { name: "Developer Portfolio", vibe: "Personal" },
      { name: "Agency Website", vibe: "Business" },
      { name: "Personal Brand", vibe: "Creator" },
      { name: "Landing Page", vibe: "Marketing" }
    ],
    featured: false
  },
  {
    title: "Custom Web App",
    startingPrice: "Rs. 60,000",
    category: "Web Development",
    icon: "Code",
    featured: true,
    features: [
      "Reduce manual work",
      "Improve business efficiency",
      "Centralize operations data",
      "Custom workflows tailored to you",
      "Secure user authentication"
    ],
    templates: [
      { name: "StudyOS", vibe: "EdTech" },
      { name: "CRM System", vibe: "Business" },
      { name: "LMS Platform", vibe: "Education" },
      { name: "Analytics Dashboard", vibe: "SaaS" }
    ]
  },
  {
    title: "E-Commerce & Backend",
    startingPrice: "Rs. 80,000",
    category: "API & Backend",
    icon: "Database",
    features: [
      "Generate more leads/sales",
      "Automated payment processing",
      "Scalable inventory management",
      "Secure API architecture"
    ],
    templates: [
      { name: "Fashion Store", vibe: "Retail" },
      { name: "Electronics Store", vibe: "E-Commerce" },
      { name: "Auth System", vibe: "Backend API" },
      { name: "Inventory API", vibe: "System" }
    ]
  }
];

const DEFAULT_MAINTENANCE = [
  {
    title: "Starter Support",
    price: "Rs. 5,000",
    recommended: false,
    features: ["Uptime monitoring", "Monthly security patches", "Basic email support"]
  },
  {
    title: "Business Support",
    price: "Rs. 10,000",
    recommended: true,
    features: ["Everything in Starter", "Weekly backups", "Minor content updates", "Priority email support"]
  },
  {
    title: "Priority Support",
    price: "Rs. 20,000",
    recommended: false,
    features: ["Everything in Business", "Daily backups", "Feature enhancements (2hrs)", "24/7 emergency response"]
  }
];

/* ── Sub-Components ────────────────────────────────────────── */

const AnimatedCounter = ({ value, label, suffix = '' }) => {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-secondary/30 transition-colors">
      <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400 mb-2 font-display">
        {value}{suffix}
      </div>
      <span className="text-xs uppercase tracking-wider text-text-muted font-mono text-center">{label}</span>
    </motion.div>
  );
};

const TrustIndicator = ({ text }) => (
  <div className="flex items-center gap-2 text-sm text-text-muted bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
    <span className="font-medium">{text}</span>
  </div>
);

const OutcomeItem = ({ text }) => (
  <div className="flex items-start gap-2.5 text-sm text-text-muted mb-2.5">
    <div className="mt-0.5 rounded-full bg-accent/20 p-0.5 shrink-0">
      <CheckCircle2 size={12} className="text-accent" />
    </div>
    <span className="leading-tight">{text}</span>
  </div>
);

const ProjectMockup = ({ name, type, demoUrl }) => {
  const content = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <FolderGit2 size={20} className="text-text-muted group-hover:text-accent transition-colors shrink-0" />
      <span className="text-xs font-bold text-text-muted group-hover:text-text transition-colors leading-tight">{name}</span>
      <span className="text-[9px] font-mono text-accent uppercase tracking-wider leading-none">{type}</span>
    </>
  );

  if (demoUrl) {
    return (
      <motion.a 
        href={demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-xl border border-white/10 bg-secondary/50 py-5 px-3 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-accent/40 transition-all duration-300 min-h-[115px] w-full"
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-secondary/50 py-5 px-3 flex flex-col items-center justify-center gap-2 text-center cursor-default hover:border-accent/40 transition-all duration-300 min-h-[115px] w-full"
    >
      {content}
    </motion.div>
  );
};

const PricingCard = ({ title, price, recommended = false, icon: Icon, outcomes, projects, onStartProject }) => {
  return (
    <motion.div 
      variants={fadeUp}
      whileHover={{ y: -6, scale: recommended ? 1.06 : 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col bg-secondary/20 backdrop-blur-md transition-all duration-300 w-full max-w-[360px] ${
        recommended 
          ? 'border border-accent shadow-[0_0_40px_rgba(56,189,248,0.15)] md:scale-105 z-10' 
          : 'border border-white/10 hover:border-white/20'
      }`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center gap-1.5">
          <Star size={12} className="fill-primary" /> Most Popular
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl ${recommended ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-muted'}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-text">{title}</h3>
      </div>

      <div className="mb-6">
        <div className="text-sm text-text-muted mb-1 font-mono uppercase tracking-wider">Starting at</div>
        <div className="text-4xl font-bold font-display text-text">{price}</div>
      </div>

      <div className="mb-8">
        <div className="text-xs font-mono text-accent mb-4 uppercase tracking-widest font-semibold border-b border-white/5 pb-2">Business Outcomes</div>
        <div className="space-y-1">
          {outcomes.map((outcome, i) => (
            <OutcomeItem key={i} text={outcome} />
          ))}
        </div>
      </div>

      {projects && projects.length > 0 && (
        <div className="mb-8 flex-grow">
          <div className="text-xs font-mono text-text-muted mb-4 uppercase tracking-widest font-semibold border-b border-white/5 pb-2">Example Projects</div>
          <div className="grid grid-cols-2 gap-3">
            {projects.map((proj, i) => {
              const isLastOdd = projects.length % 2 !== 0 && i === projects.length - 1;
              return (
                <div key={i} className={isLastOdd ? "col-span-2" : ""}>
                  <ProjectMockup name={proj.name} type={proj.type} demoUrl={proj.demoUrl} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={!(projects && projects.length > 0) ? "flex-grow" : ""} />

      <button 
        onClick={() => onStartProject({
          projectType: title,
          budget: price,
          message: `Hi Sahan, I would like to start a project for the ${title} package.`
        })}
        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
          recommended
            ? 'bg-accent text-primary hover:bg-accent/90 shadow-[0_4px_20px_rgba(56,189,248,0.25)]'
            : 'bg-white/5 text-text border border-white/10 hover:bg-white/10'
        }`}
      >
        Start Project <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};

const TechBadge = ({ name, icon: Icon }) => (
  <motion.div 
    whileHover={{ scale: 1.08, y: -3 }}
    whileTap={{ scale: 0.96 }}
    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-secondary/30 backdrop-blur-sm hover:border-accent/40 hover:bg-accent/5 transition-all cursor-default group"
  >
    {Icon ? <Icon size={16} className="text-text-muted group-hover:text-accent transition-colors" /> : <Code2 size={16} className="text-text-muted group-hover:text-accent transition-colors" />}
    <span className="text-sm font-semibold text-text-muted group-hover:text-text transition-colors">{name}</span>
  </motion.div>
);

const TimelineStep = ({ num, title, desc, icon: Icon, isLast }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: num * 0.05 }}
    className="relative flex gap-6 pb-12"
  >
    {!isLast && <div className="absolute top-10 left-6 w-px h-full bg-gradient-to-b from-accent/50 to-transparent" />}
    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary/80 border border-white/10 flex items-center justify-center text-accent backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.1)]">
      <Icon size={20} />
      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary border border-white/20 flex items-center justify-center text-[9px] font-mono font-bold text-text">{num}</div>
    </div>
    <div className="pt-2">
      <h4 className="text-lg font-bold text-text mb-2">{title}</h4>
      <p className="text-sm leading-relaxed text-text-muted max-w-md">{desc}</p>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl bg-secondary/20 backdrop-blur-sm overflow-hidden mb-4 transition-colors hover:border-white/20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-bold text-text">{question}</span>
        <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-muted'}`}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 text-sm text-text-muted leading-relaxed border-t border-white/5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Contact Modal Component ───────────────────────────────── */

const ContactModal = ({ isOpen, onClose, initialData, fallbackEmail }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: '',
    website: ''
  });
  const [formState, setFormState] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        projectType: initialData?.projectType || '',
        budget: initialData?.budget || '',
        timeline: initialData?.timeline || '',
        message: initialData?.message || '',
        website: ''
      });
      setFormState('idle');
      setErrorMessage('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        projectType: formData.projectType,
        budget: formData.budget,
        timeline: formData.timeline,
        message: formData.message,
        website: formData.website,
        _subject: `New Project Inquiry: ${formData.projectType || 'Consultation'}`,
        telemetry: {
          device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
          referrer: document.referrer || 'Direct / Bookmark',
          timestamp: new Date().toISOString()
        }
      };

      const { saveContactMessage } = await import('../lib/cms');
      await saveContactMessage(payload);
      setFormState('success');
    } catch (err) {
      console.error(err);
      setFormState('error');
      setErrorMessage(`Failed to submit message. Please try again or email directly at ${fallbackEmail}.`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/80 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-[#090D16] p-6 sm:p-8 shadow-[0_0_50px_rgba(56,189,248,0.25)] z-10 max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all">
            <X size={18} />
          </button>

          {formState === 'success' ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={32} className="text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Thank you! Your project brief has been sent successfully. I'll review it and get back to you soon.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-accent text-primary font-bold text-sm hover:bg-accent/90 transition-all">
                Close Modal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Send Project Brief</h3>
                <p className="text-xs text-white/60">Fill out the form below. Your message will be sent directly to my inbox.</p>
              </div>

              {formState === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-200 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 uppercase tracking-widest font-semibold mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-[#131926] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 uppercase tracking-widest font-semibold mb-1.5">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-[#131926] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 uppercase tracking-widest font-semibold mb-1.5">Project Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Web App"
                    value={formData.projectType}
                    onChange={e => setFormData(p => ({ ...p, projectType: e.target.value }))}
                    className="w-full bg-[#131926] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 uppercase tracking-widest font-semibold mb-1.5">Budget Range</label>
                  <input
                    type="text"
                    placeholder="e.g. Rs. 60,000"
                    value={formData.budget}
                    onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-[#131926] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 uppercase tracking-widest font-semibold mb-1.5">Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g. 2-4 weeks"
                    value={formData.timeline}
                    onChange={e => setFormData(p => ({ ...p, timeline: e.target.value }))}
                    className="w-full bg-[#131926] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-300 uppercase tracking-widest font-semibold mb-1.5">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-[#131926] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full py-3.5 rounded-xl bg-accent text-primary font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(56,189,248,0.25)] disabled:opacity-60"
                >
                  {formState === 'submitting' ? 'Sending...' : 'Send Message'} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ── Main Page ─────────────────────────────────────────────── */

const ServicesPage = () => {
  const { data: servicesDoc } = useCmsDoc(CMS_DOCS.services, { items: [] });
  const { data: faqsDoc } = useCmsDoc(CMS_DOCS.faqs, { items: [] });
  const { data: maintenanceDoc } = useCmsDoc(CMS_DOCS.maintenancePlans, { items: [] });
  const { data: testimonialsDoc } = useCmsDoc(CMS_DOCS.testimonials, { items: [] });
  const { data: skillsDoc } = useCmsDoc(CMS_DOCS.skills, { items: [] });
  const { data: siteDoc } = useCmsDoc(CMS_DOCS.site, null);

  const email = siteDoc?.contactEmail || siteDoc?.footerEmail || '';

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState(null);

  const openContactModal = (context) => {
    setModalContext(context);
    setIsModalOpen(true);
  };

  // 1. Resolve Services
  const services = useMemo(() => {
    const raw = Array.isArray(servicesDoc?.items) ? servicesDoc.items : [];
    const published = raw.filter(s => s.status !== 'Draft');
    return published.length > 0 ? published : DEFAULT_SERVICES;
  }, [servicesDoc]);

  // Safeguard: Only allow a single featured card spotlight if there is exactly 1 card marked as featured in CMS.
  const hasMultipleFeatured = useMemo(() => {
    const featuredCount = services.filter(s => s.featured === true || s.featured === 'true' || s.featured === 'on').length;
    return featuredCount > 1 || featuredCount === services.length;
  }, [services]);

  // 2. Resolve Tech Badges
  const techBadges = useMemo(() => {
    const rawGroups = Array.isArray(skillsDoc?.items) ? skillsDoc.items : [];
    const skillsList = [];
    rawGroups.forEach(group => {
      const parsedSkills = Array.isArray(group.skillsJson) 
        ? group.skillsJson 
        : (typeof group.skillsJson === 'string' ? JSON.parse(group.skillsJson || '[]') : []);
      
      parsedSkills.forEach(s => {
        if (s && s.name) {
          skillsList.push(s.name);
        }
      });
    });

    if (skillsList.length > 0) {
      return skillsList.map(name => ({ name }));
    }

    return [
      { name: "React", icon: Code2 },
      { name: "Next.js", icon: Layers },
      { name: "FastAPI", icon: Zap },
      { name: "Node.js", icon: Server },
      { name: "Firebase", icon: Database },
      { name: "PostgreSQL", icon: Database },
      { name: "Docker", icon: Cloud },
      { name: "AWS", icon: Cloud },
      { name: "Cloudflare", icon: Shield },
      { name: "Tailwind CSS", icon: LayoutTemplate },
      { name: "TypeScript", icon: Code2 },
    ];
  }, [skillsDoc]);

  // 3. Dynamic Comparison Table Rows
  const comparisonRows = useMemo(() => {
    const uniqueFeatures = new Set();
    services.forEach(s => {
      const feats = Array.isArray(s.features) ? s.features : [];
      feats.forEach(f => uniqueFeatures.add(f));
    });

    if (uniqueFeatures.size === 0) {
      return [
        { name: 'Mobile Responsive', check: s => true },
        { name: 'SEO Optimization', check: s => true },
        { name: 'CMS Integration', check: s => true },
        { name: 'Authentication', check: s => s.title?.toLowerCase().includes('app') || s.title?.toLowerCase().includes('e-commerce') || s.title?.toLowerCase().includes('backend') },
        { name: 'Admin Dashboard', check: s => s.title?.toLowerCase().includes('app') || s.title?.toLowerCase().includes('e-commerce') },
        { name: 'Custom Features', check: s => s.title?.toLowerCase().includes('app') },
        { name: 'Payment Gateway', check: s => s.title?.toLowerCase().includes('commerce') },
        { name: 'Advanced Analytics', check: s => s.title?.toLowerCase().includes('app') || s.title?.toLowerCase().includes('commerce') },
      ];
    }

    return Array.from(uniqueFeatures).map(feat => ({
      name: feat,
      check: (service) => {
        const feats = Array.isArray(service.features) ? service.features : [];
        return feats.includes(feat);
      }
    }));
  }, [services]);

  // 4. Resolve Testimonials
  const testimonials = useMemo(() => {
    const raw = Array.isArray(testimonialsDoc?.items) ? testimonialsDoc.items : [];
    const published = raw.filter(t => t.status !== 'Draft');
    return published.length > 0 ? published : [
      { name: "John Doe", role: "Startup Founder", content: "Exceptional work! The web application was delivered ahead of schedule and the code quality is top-notch. Highly recommended for any serious business looking to scale." },
      { name: "Sarah Smith", role: "E-Commerce Owner", content: "The new store design is gorgeous and our conversion rate has literally doubled. The dashboard makes managing orders effortless. Very professional!" },
      { name: "Mark Wilson", role: "Agency Director", content: "Sahan built our internal CRM perfectly to spec. Communication was excellent and the final product is incredibly fast. We will be working with him again." }
    ];
  }, [testimonialsDoc]);

  // 5. Resolve Maintenance Plans
  const maintenancePlans = useMemo(() => {
    const raw = Array.isArray(maintenanceDoc?.items) ? maintenanceDoc.items : [];
    const published = raw.filter(p => p.status !== 'Draft');
    return published.length > 0 ? published : DEFAULT_MAINTENANCE;
  }, [maintenanceDoc]);

  // 6. Resolve FAQs
  const faqs = useMemo(() => {
    const raw = Array.isArray(faqsDoc?.items) ? faqsDoc.items : [];
    const published = raw.filter(f => f.status !== 'Draft');
    return published.length > 0 ? published : [
      {
        question: "How long does a project take?",
        answer: "Depending on the scope, a standard portfolio website takes 1-2 weeks, while a custom web application or e-commerce store can take 3-6 weeks from discovery to launch."
      },
      {
        question: "Do you provide source code?",
        answer: "Yes, upon final payment, you will receive full ownership of the source code and all related assets, transferred via a private GitHub repository."
      },
      {
        question: "Can I request revisions?",
        answer: "Absolutely. I provide 2 major revision cycles during the design phase, and minor tweaks during development to ensure the final product matches your vision perfectly."
      },
      {
        question: "Do I need hosting?",
        answer: "I can deploy your application to modern cloud providers like Vercel, AWS, or DigitalOcean, and configure your custom domain. Hosting costs are handled directly by you to the provider."
      },
      {
        question: "Do you provide maintenance?",
        answer: "Yes, every project comes with 30 days of free support. After that, you can subscribe to one of my monthly maintenance plans to keep everything updated and secure."
      },
      {
        question: "What technologies do you use?",
        answer: "I specialize in the modern JavaScript ecosystem: React, Next.js, Node.js, combined with Tailwind CSS for styling, and scalable databases like PostgreSQL or Firebase."
      }
    ];
  }, [faqsDoc]);

  return (
    <>
      <SEO
        title="Services | High-Performance Digital Products"
        description="Build modern websites, web applications, and backend systems that scale. Freelance web development services."
        canonicalPath="/services"
      />

      <div className="min-h-screen bg-primary selection:bg-accent/30 selection:text-accent pb-24 relative">
        
        {/* Background Animation Warp */}
        <SpaceWarpBackground />
        
        {/* Background Glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] opacity-50" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 lg:pt-16">
          
          {/* Back button */}
          <div className="mb-8 flex items-center justify-start">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent backdrop-blur-sm"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>

          {/* HERO SECTION */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono tracking-widest uppercase mb-8"
            >
              <Zap size={14} className="animate-pulse" /> Agency-Level Engineering
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-text font-display leading-[1.1] tracking-tight mb-8"
            >
              Build Modern Websites, Web Applications & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500">Backend Systems</span> That Scale.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-text-muted leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              Helping startups, businesses, and professionals launch fast, secure, and high-performance digital products using modern technologies.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              <TrustIndicator text="15+ Projects Built" />
              <TrustIndicator text="Mobile Responsive" />
              <TrustIndicator text="SEO Optimized" />
              <TrustIndicator text="Fast Delivery" />
              <TrustIndicator text="30-Day Support" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openContactModal({
                  projectType: 'Consultation',
                  message: 'Hi Sahan, I would like to book a free consultation call to discuss my project idea.'
                })}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent text-primary font-bold text-lg shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Book Free Consultation <ArrowRight size={18} />
              </motion.button>
              <a 
                href="/projects"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-secondary/50 text-text font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                View Projects
              </a>
            </motion.div>
          </div>

          {/* SOCIAL PROOF / STATS */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32"
          >
            <AnimatedCounter value="15" suffix="+" label="Projects Delivered" />
            <AnimatedCounter value="10" suffix="+" label="Technologies Used" />
            <AnimatedCounter value="2-4" suffix=" Wks" label="Average Delivery" />
            <AnimatedCounter value="30" suffix=" Days" label="Support Period" />
          </motion.div>

          {/* FEATURED SERVICES (PRICING CARDS) */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-text mb-6">Service Packages</h2>
              <p className="text-text-muted max-w-2xl mx-auto">Transparent pricing. Clear deliverables. No hidden fees.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 items-stretch">
              {services.map((service, index) => {
                const IconComp = resolveIcon(service.icon);
                const outcomes = service.features || service.outcomes || [];
                const projects = service.templates || service.projects || [];
                const isFeatured = (service.featured === true || service.featured === 'true' || service.featured === 'on') && !hasMultipleFeatured;
                return (
                  <PricingCard
                    key={index}
                    title={service.title}
                    price={service.startingPrice || 'Rs. Contact me'}
                    recommended={isFeatured}
                    icon={IconComp}
                    outcomes={outcomes}
                    projects={projects.map(p => ({
                      name: p.name,
                      type: p.vibe || p.description || 'Project',
                      demoUrl: p.demoUrl
                    }))}
                    onStartProject={openContactModal}
                  />
                );
              })}
            </div>
          </div>

          {/* TECHNOLOGY STACK */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold font-display text-text mb-4">Technologies I Work With</h2>
              <p className="text-text-muted text-sm uppercase tracking-widest font-mono">Modern, scalable, and secure tech stack</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {techBadges.map((badge, idx) => (
                <TechBadge key={idx} name={badge.name} icon={badge.icon} />
              ))}
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold font-display text-text mb-4">Compare Features</h2>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-secondary/20 backdrop-blur-md">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-sm uppercase tracking-wider font-mono text-text">
                    <th className="p-6 font-semibold w-1/4">Features</th>
                    {services.map((s, idx) => (
                      <th key={idx} className={`p-6 font-semibold text-center w-1/4 ${s.featured ? 'text-accent' : ''}`}>
                        {s.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm text-text-muted divide-y divide-white/5">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 font-medium text-text">{row.name}</td>
                      {services.map((service, sIdx) => {
                        const hasFeature = typeof row.check === 'function' ? row.check(service) : false;
                        return (
                          <td key={sIdx} className={`p-6 text-center ${service.featured ? 'bg-accent/5' : ''}`}>
                            {hasFeature ? (
                              <CheckCircle2 size={18} className={`mx-auto ${service.featured ? 'text-accent' : 'text-emerald-400'}`} />
                            ) : (
                              <span className="text-white/20">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DEVELOPMENT PROCESS */}
          <div className="mb-32 max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold font-display text-text mb-4">How It Works</h2>
              <p className="text-text-muted">A streamlined, stress-free development process from idea to launch.</p>
            </div>
            <div className="pl-4 md:pl-10">
              <TimelineStep num="1" title="Discovery & Scoping" desc="We jump on a call to understand your business goals, target audience, and feature requirements." icon={Search} />
              <TimelineStep num="2" title="Planning & Architecture" desc="I create a technical roadmap, select the best tech stack, and define the database schema." icon={Layers} />
              <TimelineStep num="3" title="UI/UX Design" desc="Wireframing and high-fidelity mockups are created for your approval before writing any code." icon={LayoutTemplate} />
              <TimelineStep num="4" title="Development" desc="I build your product using modern, scalable frameworks with regular progress updates." icon={Terminal} />
              <TimelineStep num="5" title="Testing & QA" desc="Rigorous testing across devices and browsers to ensure a bug-free, smooth user experience." icon={Shield} />
              <TimelineStep num="6" title="Launch" desc="Deployment to production servers (Vercel, AWS, Cloudflare) with SEO setup and domain configuration." icon={Zap} />
              <TimelineStep num="7" title="Support" desc="30 days of free technical support and bug fixes post-launch to ensure everything runs perfectly." icon={Activity} isLast />
            </div>
          </div>

          {/* TESTIMONIALS */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold font-display text-text mb-4">Client Success</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((client, i) => (
                <motion.div 
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="p-6 rounded-3xl bg-secondary/20 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors flex flex-col"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: client.rating || 5 }).map((_, s) => (
                      <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-text-muted mb-6 leading-relaxed italic flex-grow">
                    "{client.content || client.review}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-auto">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || 'Client')}&background=0D1117&color=38bdf8`}
                      alt={client.name}
                      className="w-10 h-10 rounded-full border border-accent/30"
                    />
                    <div>
                      <div className="text-sm font-bold text-text">{client.name}</div>
                      <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                        {client.role} {client.company ? `@ ${client.company}` : ''}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* MAINTENANCE PLANS */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold font-display text-text mb-4">Maintenance & Support</h2>
              <p className="text-text-muted max-w-xl mx-auto">Keep your application secure, updated, and running smoothly long after the initial launch.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {maintenancePlans.map((plan, idx) => {
                const isRecommended = plan.recommended;
                return (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: isRecommended ? -10 : -6, scale: isRecommended ? 1.04 : 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`p-8 rounded-3xl flex flex-col transition-all relative ${
                      isRecommended 
                        ? 'bg-secondary/20 border border-accent shadow-[0_0_30px_rgba(56,189,248,0.1)] md:-translate-y-4' 
                        : 'bg-secondary/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Recommended
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-text mb-2">{plan.title}</h3>
                    <div className="text-2xl font-bold font-display text-text mb-6">
                      {plan.price}
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {(plan.features || []).map((feat, fIdx) => (
                        <OutcomeItem key={fIdx} text={feat} />
                      ))}
                    </ul>
                    <button 
                      onClick={() => openContactModal({
                        projectType: `Maintenance: ${plan.title}`,
                        budget: plan.price,
                        message: `Hi Sahan, I would like to sign up for the ${plan.title} maintenance package.`
                      })}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold text-center transition-colors ${
                        isRecommended 
                          ? 'bg-accent text-primary hover:bg-accent/90' 
                          : 'border border-white/10 hover:bg-white/5'
                      }`}
                    >
                      Select Plan
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-32 max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold font-display text-text mb-4">Frequently Asked Questions</h2>
            </div>
            <div>
              {faqs.map((faq, idx) => (
                <FAQItem 
                  key={idx}
                  question={faq.question} 
                  answer={faq.answer} 
                />
              ))}
            </div>
          </div>

          {/* FINAL CONVERSION SECTION */}
          <div className="relative rounded-3xl overflow-hidden border border-accent/20 bg-accent/5 p-10 md:p-16 text-center shadow-[0_0_50px_rgba(56,189,248,0.1)] mb-20">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 bg-accent/20 blur-[100px] rounded-full" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-text font-display mb-6">Let's Build Something Exceptional.</h2>
              <p className="text-text-muted text-lg mb-10">
                Tell me about your project and receive a detailed proposal with timeline, scope, and pricing within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openContactModal({
                    projectType: 'Consultation',
                    message: 'Hi Sahan, I would like to book a free consultation call to discuss my project.'
                  })}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent text-primary font-bold text-lg shadow-[0_4px_20px_rgba(56,189,248,0.3)] hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                >
                  <Star size={18} /> Book Free Consultation
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openContactModal({
                    projectType: 'Other',
                    message: 'Hi Sahan, here is a brief description of my project:\n\n'
                  })}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-secondary/50 backdrop-blur-sm text-text font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} /> Send Project Brief
                </motion.button>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                <Zap size={12} className="fill-emerald-400" /> Response within 24 hours
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic contact form modal */}
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalContext}
        fallbackEmail={email}
      />
    </>
  );
};

export default ServicesPage;
