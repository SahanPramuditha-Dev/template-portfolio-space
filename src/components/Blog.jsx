import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Clock, Tag } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const Blog = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.blog, { items: [] });
  const posts = (Array.isArray(data?.items) ? data.items : []).filter((post) => post.status !== 'Draft');
  const latestPosts = posts.slice(0, 3);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  if (loading || data === undefined) {
    return <CmsSectionSkeleton id="blog" />;
  }

  return (
    <SectionWrapper id="blog">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8 sm:mb-12 md:mb-16 font-display gradient-text">
          <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">08.</span>
          <span className="flex-grow min-w-0">Latest Articles</span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none" />
        </h2>

        {latestPosts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-secondary/20 px-6 py-16 text-center text-text-muted min-h-[320px] flex flex-col items-center justify-center">
            <p className="mx-auto max-w-2xl">
              No blog posts have been added yet. Use the admin panel to publish tutorials, deep dives, and case studies.
            </p>
            <a
              href="/admin"
              className="mt-6 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
            >
              Manage blog posts
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[320px]">
            {latestPosts.map((post, index) => {
              // Prefer slug-based route, fall back to post.link
              const href = post.slug
                ? `/blog/${post.slug}`
                : post.link || null;

              return (
                <motion.a
                  key={post.title || index}
                  href={href || undefined}
                  onClick={!href ? (e) => e.preventDefault() : undefined}
                  target={!href || href.startsWith('/') ? '_self' : '_blank'}
                  rel={!href || href.startsWith('/') ? undefined : 'noreferrer'}
                  onMouseMove={handleMouseMove}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`glass-card p-6 rounded-xl border border-secondary/50 hover:border-accent/50 transition-all duration-300 group bg-secondary/20 hover:bg-secondary/30 h-full flex flex-col${href ? ' cursor-pointer' : ''}`}
                >
                  {post.featured && (
                    <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs font-mono rounded mb-3 w-fit">
                      Featured
                    </span>
                  )}

                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                      <BookOpen className="text-accent" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-xs text-text-muted mt-auto">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{post.date || 'Draft'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{post.readTime || '5 min read'}</span>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {splitCsv(post.tags).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-primary/50 px-3 py-1 text-xs text-text-muted">
                        <Tag size={11} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {href && (
                    <span className="inline-flex items-center gap-1.5 text-accent text-sm font-mono group-hover:gap-3 transition-all duration-200">
                      Read Article →
                    </span>
                  )}
                </motion.a>
              );
            })}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Blog;
