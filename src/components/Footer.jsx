import React from 'react';
import { Github, Linkedin, Mail, Facebook, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { FooterCmsSkeleton } from './CmsShapeSkeleton';
import CopyEmailButton from './CopyEmailButton';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: siteDoc, exists, loading } = useCmsDoc(CMS_DOCS.site, null);

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
    <footer className="relative z-10 border-t border-secondary bg-primary/90 pt-12 pb-8 backdrop-blur-md">
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
          <p className="flex items-center gap-1">
            © {currentYear} Sahan Pramuditha. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="flex items-center gap-2">
              Made with <Heart size={14} className="fill-red-500 text-red-500 animate-pulse" /> using React & Three.js
            </p>
            <div className="flex items-center gap-4">
              {email ? (
                <CopyEmailButton email={email} compact className="rounded-full px-3 py-1.5 text-xs" />
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

export default Footer;
