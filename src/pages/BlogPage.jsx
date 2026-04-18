import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Filter, Tag, Search, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const BlogPage = () => {
  const { data } = useCmsDoc(CMS_DOCS.blog, { items: [] });
  const posts = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);
  const [activeTag, setActiveTag] = useState('All');
  const [query, setQuery] = useState('');

  const tags = useMemo(() => ['All', ...new Set(posts.flatMap((post) => splitCsv(post.tags)))], [posts]);

  const filteredPosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesTag = activeTag === 'All' || splitCsv(post.tags).includes(activeTag);
      const haystack = `${post.title || ''} ${post.excerpt || ''} ${post.body || ''} ${post.category || ''}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesTag && matchesSearch;
    });
  }, [posts, activeTag, query]);

  return (
    <>
      <SEO
        title="Blog | Sahan Pramuditha"
        description="Tutorials, deep dives, and case studies about building software, systems, and digital products."
        canonicalPath="/blog"
      />
      <PageShell
        eyebrow="Dev Writing"
        title="Tutorials, case studies, and engineering notes."
        description="A place for deep dives, code snippets, and the kind of write-ups that help future-you and other builders move faster."
        actions={(
          <a href="/admin" className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            Manage posts
          </a>
        )}
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-secondary/20 p-4 backdrop-blur-md">
            <label className="sr-only" htmlFor="blog-search">Search posts</label>
            <div className="flex items-center gap-3 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3">
              <Search size={18} className="text-accent" />
              <input
                id="blog-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-text outline-none placeholder:text-text-muted"
                placeholder="Search posts"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-secondary/20 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <Filter size={16} className="text-accent" />
              Filter by tag
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-mono ${
                    activeTag === tag ? 'bg-accent text-primary' : 'border border-secondary/40 bg-primary/50 text-text-muted'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No blog posts yet. Add one from the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPosts.map((post, index) => {
              const slug = post.slug || slugify(post.title);
              return (
              <motion.article
                key={slug || post.title || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {post.featured && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-amber-300">
                      Featured
                    </span>
                  )}
                  {post.category && (
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-accent">
                      {post.category}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-text">{post.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} />
                    {post.date || 'Draft'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime || '5 min read'}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">{post.excerpt}</p>
                {post.body && (
                  <p className="mt-4 text-sm leading-relaxed text-text-muted whitespace-pre-line">
                    {String(post.body).slice(0, 220)}
                  </p>
                )}
                {post.codeSnippet && (
                  <pre className="mt-4 overflow-x-auto rounded-2xl border border-secondary/50 bg-primary/70 p-4 text-xs text-accent">
                    <code>{post.codeSnippet}</code>
                  </pre>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {splitCsv(post.tags).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-primary/50 px-3 py-1 text-xs text-text-muted">
                      <Tag size={11} />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-[0.18em] text-text-muted">
                    {slug ? 'Open article' : 'Draft only'}
                  </span>
                  {slug ? (
                    <a href={`/blog/${slug}`} className="inline-flex items-center gap-1 text-accent">
                      Read more
                      <ChevronRight size={14} />
                    </a>
                  ) : null}
                </div>
              </motion.article>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
};

export default BlogPage;
