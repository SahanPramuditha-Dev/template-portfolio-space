import React, { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail, Facebook, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { FooterCmsSkeleton } from './CmsShapeSkeleton';
import { useAchievements } from '../context/AchievementsContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: siteDoc, exists, loading } = useCmsDoc(CMS_DOCS.site, null);
  const footerRef = useRef(null);
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          unlockAchievement('space-voyager');
        }
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    return () => observer.disconnect();
  }, [unlockAchievement]);

  if (loading || siteDoc === undefined) {
    return <FooterCmsSkeleton />;
  }

  const socialLinks = exists && Array.isArray(siteDoc?.socialLinksJson) && siteDoc.socialLinksJson.length > 0
    ? siteDoc.socialLinksJson.map((link) => ({
        ...link,
        icon:
          link.label === 'GitHub'
            ? Github
            : link.label === 'LinkedIn'
            ? Linkedin
            : link.label === 'Facebook'
            ? Facebook
            : Mail,
      }))
    : [];

  const tagline = siteDoc?.footerTagline || '';
  const email = siteDoc?.footerEmail || '';
  const pageLinks = [
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/resume' },
    { label: 'Resources', href: '/resources' },
    { label: 'Services', href: '/services' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <footer ref={footerRef} className="relative z-10 border-t border-secondary bg-primary/90 pt-12 pb-8 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="mb-2 text-2xl font-bold text-text">
              S<span className="text-accent">ahan.</span>
            </h3>
            {tagline ? <p className="max-w-xs text-sm text-text-muted">{tagline}</p> : null}
          </div>

          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.label === 'Email' ? '_self' : '_blank'}
                rel={link.label === 'Email' ? undefined : 'noreferrer'}
                className="rounded-full p-2 text-text-muted transition-colors hover:bg-secondary/50 hover:text-accent"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={link.label}
              >
                <link.icon size={20} />
              </motion.a>
            ))}
            {socialLinks.length === 0 && (
              <p className="text-sm text-text-muted">Add footer links in the admin panel.</p>
            )}
          </div>
        </div>

        <div className="mb-8 h-px w-full bg-secondary opacity-50" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-text-muted md:flex-row">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center md:text-left">
            <p>© {currentYear} Sahan Pramuditha. All rights reserved.</p>
            <span className="hidden sm:inline-block text-text-muted/40">•</span>
            <PageViewsCounter />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="flex items-center gap-2">
              Made with <Heart size={14} className="fill-red-500 text-red-500 animate-pulse" /> using React & Three.js
            </p>
            <div className="flex items-center gap-4">
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-mono text-text-muted hover:text-accent hover:border-accent/30 transition-colors"
                >
                  {email}
                </a>
              ) : null}
              <a
                href="/admin"
                className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-primary"
              >
                Admin Login
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.16em] text-text-muted">
          {pageLinks.map((link) => (
            <a key={link.label} href={link.href} className="rounded-full border border-secondary/40 px-3 py-1 transition-colors hover:border-accent/30 hover:text-accent">
              {link.label}
            </a>
          ))}
          <a href="/privacy" className="rounded-full border border-secondary/40 px-3 py-1 transition-colors hover:border-accent/30 hover:text-accent">Privacy</a>
          <a href="/cookies" className="rounded-full border border-secondary/40 px-3 py-1 transition-colors hover:border-accent/30 hover:text-accent">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

const PageViewsCounter = () => {
  const [views, setViews] = useState(null);

  useEffect(() => {
    // Import Firestore components dynamically to keep bundle size light
    const getCount = async () => {
      try {
        const { getFirestore, collection, getCountFromServer, query, where } = await import('firebase/firestore');
        const { app } = await import('../lib/firebase');
        const db = getFirestore(app);
        const q = query(
          collection(db, 'analyticsEvents'),
          where('eventName', '==', 'page_view')
        );
        const snapshot = await getCountFromServer(q);
        setViews(snapshot.data().count);
      } catch (err) {
        console.error('Failed to get public page views count:', err);
      }
    };
    getCount();
  }, []);

  if (views === null) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded text-[11px] font-mono text-accent">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
      {views} orbital views
    </span>
  );
};

export default Footer;
