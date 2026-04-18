import React from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Tag, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const ResourcesPage = () => {
  const { data } = useCmsDoc(CMS_DOCS.resources, { items: [] });
  const items = Array.isArray(data?.items) ? data.items : [];

  return (
    <>
      <SEO
        title="Resources | Sahan Pramuditha"
        description="Curated tools, APIs, cheat sheets, and annotated links."
        canonicalPath="/resources"
      />
      <PageShell
        eyebrow="Curated Tools"
        title="Resources worth keeping nearby."
        description="Use this section for your favorite tools, APIs, references, and cheat sheets."
      >
        {items.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No resources have been added yet. Add them in the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item, index) => (
              <motion.article
                key={item.title || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <LinkIcon className="text-accent" size={24} />
                  <div>
                    <h2 className="text-2xl font-bold text-text">{item.title}</h2>
                    <p className="text-sm text-text-muted">{item.type || item.category}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.category ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-primary/50 px-3 py-1 text-xs text-text-muted">
                      <Tag size={11} />
                      {item.category}
                    </span>
                  ) : null}
                </div>
                {item.url ? (
                  <a href={item.url} className="mt-5 inline-flex items-center gap-2 text-accent">
                    Open link
                    <ExternalLink size={14} />
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

export default ResourcesPage;
