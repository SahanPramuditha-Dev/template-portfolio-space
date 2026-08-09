import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Filter, Tag, Search, ChevronRight, BookOpen, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import GlowCard from '../components/GlowCard';
import PageLoader from '../components/PageLoader';
import { BLOG_POSTS } from '../data/blogPosts';

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
  const { data, loading } = useCmsDoc(CMS_DOCS.blog, { items: [] });
  
  const posts = useMemo(() => {
    const firestoreItems = Array.isArray(data?.items) ? data.items : [];
    const mergedMap = new Map();
    // Pre-populate with fallback articles
    BLOG_POSTS.forEach((p) => mergedMap.set(p.slug || slugify(p.title), p));
    // Override/append firestore items if present
    firestoreItems.forEach((p) => {
      const key = p.slug || slugify(p.title);
      if (key) mergedMap.set(key, p);
    });
    return Array.from(mergedMap.values());
  }, [data]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  const [query, setQuery] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);

  // Extract categories list
  const categories = useMemo(() => {
    const list = new Set(['All']);
    posts.forEach((post) => {
      if (post.category) list.add(post.category);
    });
    return Array.from(list);
  }, [posts]);

  // Extract tags list scoped to selected category
  const tags = useMemo(() => {
    const list = new Set(['All']);
    posts.forEach((post) => {
      if (activeCategory === 'All' || post.category === activeCategory) {
        splitCsv(post.tags).forEach((tag) => list.add(tag));
      }
    });
    return Array.from(list);
  }, [posts, activeCategory]);

  const visibleTags = useMemo(() => {
    if (showAllTags || tags.length <= 12) return tags;
    return tags.slice(0, 12);
  }, [tags, showAllTags]);

  const filteredPosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const postTags = splitCsv(post.tags);
      const matchesTag = activeTag === 'All' || postTags.includes(activeTag);
      const haystack = `${post.title || ''} ${post.excerpt || ''} ${post.body || ''} ${post.category || ''} ${post.tags || ''}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [posts, activeCategory, activeTag, query]);

  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured) || posts[0] || null;
  }, [posts]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveTag('All');
  };

  if (loading && posts.length === 0) {
    return (
      <>
        <SEO
          title="Blog | Sahan Pramuditha"
          description="Tutorials, deep dives, and engineering notes about software development, AI, networking, performance, and systems."
          canonicalPath="/blog"
        />
        <PageLoader text="Loading publications" subtext="Fetching engineering articles..." />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Blog | Sahan Pramuditha"
        description="Tutorials, deep dives, and engineering notes about software development, AI, networking, performance, and systems."
        canonicalPath="/blog"
      />
      <PageShell
        eyebrow="Dev Writing"
        title="Software, Systems & Engineering Notes"
        description="A varied collection of deep dives, personal reflections, technical retrospectives, and architecture experiments."
        actions={(
          <a href="/admin" className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            Manage posts
          </a>
        )}
      >
        {/* Featured Spotlight Card */}
        {featuredPost && !query && activeCategory === 'All' && activeTag === 'All' && (
          <div className="mb-10">
            <GlowCard className="p-8 border-accent/30 bg-secondary/30 relative overflow-hidden" glowColor="rgba(56,189,248,0.25)">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[0.7rem] font-mono uppercase tracking-[0.14em] text-amber-300 font-bold">
                  ★ Featured Article
                </span>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.7rem] font-mono uppercase tracking-[0.14em] text-accent">
                  {featuredPost.category}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text font-display leading-tight">
                <a href={`/blog/${featuredPost.slug || slugify(featuredPost.title)}`} className="hover:text-accent transition-colors">
                  {featuredPost.title}
                </a>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed max-w-3xl">
                {featuredPost.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-text-muted font-mono">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} className="text-accent" />
                    {featuredPost.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-accent" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <a
                  href={`/blog/${featuredPost.slug || slugify(featuredPost.title)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent/90 transition-all shadow-lg"
                >
                  <span>Read Full Article</span>
                  <ChevronRight size={16} />
                </a>
              </div>
            </GlowCard>
          </div>
        )}

        {/* Search and Category Filters */}
        <div className="space-y-4 mb-8">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <GlowCard className="p-4 border-white/10" glowColor="rgba(56,189,248,0.15)">
              <label className="sr-only" htmlFor="blog-search">Search posts</label>
              <div className="flex items-center gap-3 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3">
                <Search size={18} className="text-accent" />
                <input
                  id="blog-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-text outline-none placeholder:text-text-muted text-sm"
                  placeholder="Search articles by title, keyword, or technology..."
                />
              </div>
            </GlowCard>

            <GlowCard className="p-4 border-white/10" glowColor="rgba(56,189,248,0.15)">
              <div className="flex items-center gap-2 text-xs font-semibold text-text uppercase tracking-wider font-mono">
                <Layers size={14} className="text-accent" />
                Category
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-mono transition-all ${
                      activeCategory === cat ? 'bg-accent text-primary font-bold shadow-sm' : 'border border-secondary/40 bg-primary/50 text-text-muted hover:border-accent/40 hover:text-text'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </GlowCard>
          </div>

          {/* Tag Filter Bar */}
          <GlowCard className="p-4 border-white/10" glowColor="rgba(56,189,248,0.1)">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-text uppercase tracking-wider">
                <Filter size={13} className="text-accent" />
                Filter by Tag {activeCategory !== 'All' && <span className="text-accent/80 font-normal">({activeCategory})</span>}
              </span>
              {tags.length > 12 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-[0.7rem] font-mono text-accent hover:underline"
                >
                  {showAllTags ? 'Show fewer tags' : `+ ${tags.length - 12} more tags`}
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-md px-2.5 py-1 text-xs font-mono transition-all ${
                    activeTag === tag
                      ? 'bg-accent/20 text-accent font-semibold border border-accent/40 shadow-sm'
                      : 'border border-secondary/30 bg-primary/40 text-text-muted hover:text-text hover:border-accent/30'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            <BookOpen className="mx-auto text-accent/50 mb-3" size={32} />
            <p className="text-lg text-text">No articles found matching your criteria.</p>
            <p className="text-sm mt-1">Try clearing your search query or selecting a different category filter.</p>
            <button
              onClick={() => { setQuery(''); setActiveCategory('All'); setActiveTag('All'); }}
              className="mt-4 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-mono text-accent"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPosts.map((post, index) => {
              const slug = post.slug || slugify(post.title);
              return (
                <GlowCard
                  key={slug || post.title || index}
                  index={index}
                  className="p-6 border-white/10 flex flex-col h-full"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {post.featured && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[0.65rem] font-mono uppercase tracking-wider text-amber-300">
                          Featured
                        </span>
                      )}
                      {post.category && (
                        <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[0.65rem] font-mono uppercase tracking-wider text-accent font-semibold">
                          {post.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-text group-hover:text-accent transition-colors leading-snug">
                    <a href={`/blog/${slug}`}>
                      {post.title}
                    </a>
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {splitCsv(post.tags).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-primary/50 px-2.5 py-0.5 text-[0.7rem] font-mono text-text-muted">
                        <Tag size={10} className="text-accent" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">
                      {post.author || 'Sahan Pramuditha'}
                    </span>
                    <a href={`/blog/${slug}`} className="inline-flex items-center gap-1 text-accent font-semibold group-hover:translate-x-1 transition-transform">
                      Read Article
                      <ChevronRight size={14} />
                    </a>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        )}
      </PageShell>
    </>
  );
};

export default BlogPage;

