import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Send, CheckCircle, Loader2, Download, CalendarDays, ExternalLink, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import SectionWrapper from './SectionWrapper';
import { trackContactSubmit, trackDownload } from '../utils/analytics';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';
const Contact3D = React.lazy(() => import('./Contact3D'));

const Contact = () => {
  const [formState, setFormState] = useState('idle'); // idle, submitting, success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: '',
    website: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const prefersReducedMotion = useReducedMotion();
  const { data: siteDoc, loading } = useCmsDoc(CMS_DOCS.site, null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handlePrefill = () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      
      const projectType = params.get('projectType') || hashParams.get('projectType') || '';
      const message = params.get('message') || hashParams.get('message') || '';
      const budget = params.get('budget') || hashParams.get('budget') || '';
      const timeline = params.get('timeline') || hashParams.get('timeline') || '';

      if (projectType || message || budget || timeline) {
        setFormData(prev => ({
          ...prev,
          projectType: projectType || prev.projectType,
          message: message ? decodeURIComponent(message) : prev.message,
          budget: budget || prev.budget,
          timeline: timeline || prev.timeline
        }));
      }
    };

    handlePrefill();
    window.addEventListener('hashchange', handlePrefill);
    return () => window.removeEventListener('hashchange', handlePrefill);
  }, []);

  if (loading || siteDoc === undefined) {
    return <CmsSectionSkeleton id="contact" />;
  }

  const availability = siteDoc?.availability || 'Open to new work.';
  const preferredContact = siteDoc?.preferredContact || 'Email works best for detailed inquiries.';
  const responseSla = siteDoc?.responseSla || 'Usually replies within 1-2 business days.';
  const contactEmail = siteDoc?.contactEmail || siteDoc?.footerEmail || 'contact@sahanpramuditha.com';
  const resumeUrl = siteDoc?.resumeUrl || '/resume.pdf';
  const bookingUrl = siteDoc?.bookingUrl || import.meta.env.VITE_BOOKING_URL || '';

  const triggerConfetti = () => {
    if (prefersReducedMotion) return;
    const end = Date.now() + 1000;

    const colors = ['#0ea5e9', '#38bdf8'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.length < 2) {
      setErrorMessage('Please enter your name (at least 2 characters).');
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.message || formData.message.length < 10) {
      setErrorMessage('Your message should be at least 10 characters long.');
      return;
    }
    if (formData.website) {
      setFormState('success');
      return;
    }
    
    setErrorMessage('');
    setFormState('submitting');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        projectType: formData.projectType,
        budget: formData.budget,
        timeline: formData.timeline,
        message: formData.message,
        website: formData.website,
        _subject: 'New message from portfolio contact form'
      };

      // 1. Save directly to Firestore Admin Inbox
      try {
        const { saveContactMessage } = await import('../lib/cms');
        await saveContactMessage(payload);
      } catch (dbErr) {
        console.error('Failed to save to Firestore inbox:', dbErr);
      }

      // 2. Send via Formspree / API endpoint for email notification
      const endpoint =
        import.meta.env.VITE_CONTACT_ENDPOINT ||
        (import.meta.env.VITE_FORMSPREE_ID
          ? `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_ID}`
          : import.meta.env.PROD ? '/api/contact' : null);
      
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to submit to endpoint');
      } else {
        const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
          'Portfolio Contact'
        )}&body=${encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
          + `\n\nProject type: ${formData.projectType || 'Not specified'}`
          + `\nBudget: ${formData.budget || 'Not specified'}`
          + `\nTimeline: ${formData.timeline || 'Not specified'}`
        )}`;
        window.location.href = mailto;
      }
      setFormState('success');
      setFormData({ name: '', email: '', projectType: '', budget: '', timeline: '', message: '', website: '' });
      triggerConfetti();
      trackContactSubmit(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      setFormState('idle');
      setErrorMessage(`Something went wrong while sending your message. Please try again in a moment or email me directly at ${contactEmail}.`);
      trackContactSubmit(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <SectionWrapper id="contact" className="min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-accent font-mono text-lg mb-4">09. What's Next?</h2>
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-6 gradient-text">Get In Touch</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-6">
            Tell me what you are building, what timeline you have in mind, and where I can help. I keep the first reply practical so we can decide the next step quickly.
          </p>
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-mono text-emerald-300">
              {availability}
            </span>
            <span className="rounded-full border border-secondary/40 bg-secondary/20 px-4 py-2 text-sm text-text-muted">
              {responseSla}
            </span>
          </div>
          <p className="mx-auto mb-6 max-w-2xl text-sm text-text-muted">
            Preferred contact method: {preferredContact}
          </p>
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
            >
              <Mail size={16} />
              {contactEmail}
            </a>
            {bookingUrl ? (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-primary"
              >
                <CalendarDays size={16} />
                Book a call
                <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
          {/* Resume Download Link */}
          <motion.a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={() => trackDownload('resume')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 border border-accent text-accent rounded-lg hover:bg-accent hover:text-primary transition-all duration-300 font-mono text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={18} />
            Download Resume
          </motion.a>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Form Side */}
          <div className="max-w-xl w-full mx-auto glass-card p-8 rounded-2xl relative overflow-hidden order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {formState === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-2">Message Sent!</h3>
                  <p className="text-text-muted mb-8">Thanks for reaching out. I'll get back to you soon.</p>
                  <motion.button
                    onClick={() => setFormState('idle')}
                    className="px-6 py-2 bg-secondary text-text rounded-lg hover:bg-accent hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send another message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  aria-busy={formState === 'submitting'}
                  className="space-y-6"
                >
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={handleChange}
                    className="hidden"
                    aria-hidden="true"
                  />
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-xs md:text-sm text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-4 py-2 font-mono"
                      role="alert"
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                  <div className="relative group">
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      type="text"
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      id="contact-name"
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer placeholder:text-white invalid:border-red-500/50"
                      placeholder=" "
                      aria-describedby="name-error"
                      aria-invalid={Boolean(formData.name && formData.name.length < 2)}
                    />
                    <label htmlFor="contact-name" className="absolute left-4 top-3 text-text-muted transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    {formData.name && formData.name.length < 2 && (
                      <p id="name-error" className="text-xs text-red-400 mt-1 ml-4" role="alert">
                        Name must be at least 2 characters
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="relative group">
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleChange}
                        id="contact-project-type"
                        className="w-full appearance-none bg-primary/50 border border-secondary rounded-lg px-4 py-3 pr-10 text-text outline-none focus:border-accent transition-colors cursor-pointer"
                      >
                        <option value="" className="bg-primary text-text">Project type</option>
                        <option value="Website" className="bg-primary text-text">Website</option>
                        <option value="Web app" className="bg-primary text-text">Web app</option>
                        <option value="E-commerce" className="bg-primary text-text">E-commerce</option>
                        <option value="API / backend" className="bg-primary text-text">API / backend</option>
                        <option value="UI polish" className="bg-primary text-text">UI polish</option>
                        <option value="Other" className="bg-primary text-text">Other</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </div>
                    <div className="relative group">
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        id="contact-budget"
                        className="w-full appearance-none bg-primary/50 border border-secondary rounded-lg px-4 py-3 pr-10 text-text outline-none focus:border-accent transition-colors cursor-pointer"
                      >
                        <option value="" className="bg-primary text-text">Budget range</option>
                        <option value="Below LKR 5,000" className="bg-primary text-text">Below LKR 5,000</option>
                        <option value="Below LKR 10,000" className="bg-primary text-text">Below LKR 10,000</option>
                        <option value="Below LKR 15,000" className="bg-primary text-text">Below LKR 15,000</option>
                        <option value="Below LKR 25,000" className="bg-primary text-text">Below LKR 25,000</option>
                        <option value="Below LKR 50,000" className="bg-primary text-text">Below LKR 50,000</option>
                        <option value="50,000+" className="bg-primary text-text">50,000+</option>
                        <option value="Not sure yet" className="bg-primary text-text">Not sure yet</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </div>
                    <div className="relative group">
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        id="contact-timeline"
                        className="w-full appearance-none bg-primary/50 border border-secondary rounded-lg px-4 py-3 pr-10 text-text outline-none focus:border-accent transition-colors cursor-pointer"
                      >
                        <option value="" className="bg-primary text-text">Timeline</option>
                        <option value="ASAP" className="bg-primary text-text">ASAP</option>
                        <option value="2-4 weeks" className="bg-primary text-text">2-4 weeks</option>
                        <option value="1-3 months" className="bg-primary text-text">1-3 months</option>
                        <option value="Flexible" className="bg-primary text-text">Flexible</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </div>
                  </div>

                  <div className="relative group">
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      id="contact-email"
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer placeholder:text-white invalid:border-red-500/50"
                      placeholder=" "
                      aria-describedby="email-error"
                      aria-invalid={Boolean(formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                    />
                    <label htmlFor="contact-email" className="absolute left-4 top-3 text-text-muted transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Your Email <span className="text-red-400">*</span>
                    </label>
                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                      <p id="email-error" className="text-xs text-red-400 mt-1 ml-4" role="alert">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  <div className="relative group">
                    <motion.textarea
                      variants={inputVariants}
                      whileFocus="focus"
                      name="message"
                      required
                      rows="4"
                      minLength={10}
                      maxLength={1000}
                      autoComplete="off"
                      value={formData.message}
                      onChange={handleChange}
                      id="contact-message"
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer resize-none placeholder:text-white invalid:border-red-500/50"
                      placeholder=" "
                      aria-describedby="message-error"
                      aria-invalid={Boolean(formData.message && formData.message.length < 10)}
                    ></motion.textarea>
                    <label htmlFor="contact-message" className="absolute left-4 top-3 text-text-muted transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Message <span className="text-red-400">*</span>
                    </label>
                    {formData.message && formData.message.length < 10 && (
                      <p id="message-error" className="text-xs text-red-400 mt-1 ml-4" role="alert">
                        Message must be at least 10 characters ({formData.message.length}/10)
                      </p>
                    )}
                    <p className={`text-xs mt-1 ml-4 text-right transition-colors ${
                      formData.message.length > 900 ? 'text-red-400' : formData.message.length > 700 ? 'text-amber-400' : 'text-text-muted'
                    }`}>
                      {formData.message.length}/1000
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={formState === 'submitting'}
                    aria-disabled={formState === 'submitting'}
                    className="w-full bg-accent/10 border border-accent text-accent font-bold py-4 rounded-lg hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {formState === 'submitting' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* 3D Side */}
          <motion.div 
            className="h-[400px] w-full order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Suspense fallback={<div className="w-full h-full rounded-2xl bg-gradient-to-br from-accent/20 via-secondary to-primary" />}>
              <Contact3D />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
