import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { Link } from 'react-router-dom';

const PageShell = ({ eyebrow, title, description, actions, children, backHref = '/' }) => {
  return (
    <div className="min-h-screen bg-primary text-text">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_34%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]" />
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {(eyebrow || title || description) && (
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 rounded-3xl border border-white/10 bg-secondary/20 p-8 backdrop-blur-md"
          >
            {eyebrow ? (
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
            ) : null}
            {title ? (
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-text sm:text-5xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-muted sm:text-lg">
                {description}
              </p>
            ) : null}
          </motion.header>
        )}

        <main className="space-y-8">{children}</main>
      </div>
    </div>
  );
};

export default PageShell;
