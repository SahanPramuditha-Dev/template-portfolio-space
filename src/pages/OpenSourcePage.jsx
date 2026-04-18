import React from 'react';
import { motion } from 'framer-motion';
import { Github, Star, GitFork, Eye } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const OpenSourcePage = () => {
  const { data } = useCmsDoc(CMS_DOCS.openSource, { items: [] });
  const { data: siteDoc } = useCmsDoc(CMS_DOCS.site, null);
  const items = Array.isArray(data?.items) ? data.items : [];
  const githubUsername = siteDoc?.githubUsername || 'SahanPramuditha-Dev';

  return (
    <>
      <SEO
        title="Open Source | Sahan Pramuditha"
        description="Open source libraries, packages, and contributions."
        canonicalPath="/opensource"
      />
      <PageShell
        eyebrow="Contributions"
        title="Open source work and community contributions."
        description="Track your own OSS packages, repos, and external PRs here with simple metrics and status."
      >
        <div className="rounded-3xl border border-white/10 bg-secondary/20 p-5 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-3">
            <Github className="text-accent" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-text">Contribution graph</h2>
              <p className="text-sm text-text-muted">GitHub activity snapshot for {githubUsername}</p>
            </div>
          </div>
          <img
            src={`https://ghchart.rshah.org/${githubUsername}`}
            alt="GitHub contribution graph"
            className="w-full rounded-2xl border border-secondary/40 bg-primary/50"
          />
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No open source projects have been added yet. Add them in the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item, index) => (
              <motion.article
                key={item.name || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <Github className="text-accent" size={24} />
                  <div>
                    <h2 className="text-2xl font-bold text-text">{item.name}</h2>
                    <p className="text-sm text-text-muted">{item.category || item.status || 'Open source'}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{item.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-2xl border border-secondary/40 bg-primary/50 p-3">
                    <Star className="mx-auto mb-1 text-amber-300" size={16} />
                    {item.stars || 0}
                  </div>
                  <div className="rounded-2xl border border-secondary/40 bg-primary/50 p-3">
                    <GitFork className="mx-auto mb-1 text-accent" size={16} />
                    {item.forks || 0}
                  </div>
                  <div className="rounded-2xl border border-secondary/40 bg-primary/50 p-3">
                    <Eye className="mx-auto mb-1 text-text-muted" size={16} />
                    {item.watchers || 0}
                  </div>
                </div>
                {item.repository ? (
                  <a href={item.repository} className="mt-5 inline-flex items-center gap-2 text-accent">
                    View repository
                  </a>
                ) : null}
              </motion.article>
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
};

export default OpenSourcePage;
