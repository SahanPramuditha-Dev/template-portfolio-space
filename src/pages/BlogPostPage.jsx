import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ChevronLeft, Code2, User, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import PageLoader from '../components/PageLoader';
import { renderSimpleMarkdown } from '../utils/markdown';
import { BLOG_POSTS } from '../data/blogPosts';
import GlowCard from '../components/GlowCard';

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

const BlogPostPage = () => {
  const { slug } = useParams();
  const { data, loading } = useCmsDoc(CMS_DOCS.blog, { items: [] });
  
  const posts = useMemo(() => {
    const firestoreItems = Array.isArray(data?.items) ? data.items : [];
    // Merge firestore items with BLOG_POSTS fallbacks seamlessly
    const mergedMap = new Map();
    BLOG_POSTS.forEach(p => mergedMap.set(p.slug || slugify(p.title), p));
    firestoreItems.forEach(p => {
      const key = p.slug || slugify(p.title);
      if (key) mergedMap.set(key, p);
    });
    return Array.from(mergedMap.values());
  }, [data]);

  const post = useMemo(() => {
    return posts.find((item) => (item.slug || slugify(item.title)) === slug) || null;
  }, [posts, slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts
      .filter((p) => (p.slug || slugify(p.title)) !== slug && (p.category === post.category || p.featured))
      .slice(0, 2);
  }, [posts, post, slug]);

  if (loading && posts.length === 0) {
    return (
      <>
        <SEO title="Blog | Sahan Pramuditha" description="Loading article…" canonicalPath={`/blog/${slug || ''}`} />
        <PageLoader text="Loading article" subtext="Fetching publication content..." />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <SEO title="Post Not Found | Sahan Pramuditha" description="The requested blog post could not be found." canonicalPath={`/blog/${slug || ''}`} noindex />
        <PageShell
          eyebrow="Dev Writing"
          title="Post Not Found"
          description="That article isn’t published yet or the URL path is incorrect."
          backHref="/blog"
        >
          <div className="rounded-3xl border border-white/10 bg-secondary/20 p-12 text-center text-text-muted">
            <p className="mb-6">The article you are looking for might have been moved or renamed.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary">
              <ChevronLeft size={16} />
              Return to Blog Index
            </Link>
          </div>
        </PageShell>
      </>
    );
  }

  const title = post.title || 'Blog Post';
  const description = post.excerpt || String(post.body || '').slice(0, 160);
  const canonicalPath = `/blog/${post.slug || slugify(post.title)}`;
  const authorName = post.author || 'Sahan Pramuditha';
  const publishDate = post.date || '2026-08-01';

  // Article JSON-LD Structured Data
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://sahanpramuditha.me',
    },
    datePublished: publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sahanpramuditha.me${canonicalPath}`,
    },
    keywords: post.tags,
  };

  return (
    <>
      <SEO 
        title={`${title} | Sahan Pramuditha`} 
        description={description} 
        canonicalPath={canonicalPath}
        scriptJsonLd={jsonLdData}
      />
      <PageShell
        eyebrow={post.category || 'Dev Writing'}
        title={title}
        description={description}
        backHref="/blog"
      >
        <article className="mx-auto max-w-4xl">
          {/* Article Header Bar */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-secondary/30 p-6 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {post.featured && (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-amber-300">
                    Featured Article
                  </span>
                )}
                {post.category && (
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.12em] text-accent font-semibold">
                    {post.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <User size={13} className="text-accent" />
                  {authorName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} className="text-accent" />
                  {publishDate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-accent" />
                  {post.readTime || '6 min read'}
                </span>
              </div>
            </div>
          </div>

          {/* Article Content Container */}
          <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 sm:p-10 backdrop-blur-md text-text">
            {/* Rich Markdown Rendering */}
            <div className="prose prose-invert max-w-none space-y-6">
              {renderSimpleMarkdown(post.body || post.excerpt)}
            </div>

            {/* Optional Standalone Code Snippet if present outside markdown */}
            {post.codeSnippet && !post.body?.includes('```') && (
              <div className="mt-8">
                <div className="mb-2 text-xs font-mono text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 size={14} />
                  <span>Key Code Implementation ({post.language || 'code'})</span>
                </div>
                <pre className="overflow-x-auto rounded-2xl border border-accent/20 bg-primary/90 p-5 text-sm text-accent font-mono shadow-inner">
                  <code>{post.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Article Tags Footer */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {splitCsv(post.tags).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-secondary/50 bg-primary/60 px-3.5 py-1.5 text-xs text-text-muted">
                    <Tag size={12} className="text-accent" />
                    {tag}
                  </span>
                ))}
              </div>
              
              {post.link && (
                <a
                  href={post.link}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-mono text-accent hover:bg-accent/20 transition-all"
                >
                  <span>Explore Related Case Study</span>
                  <ArrowRight size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Author Bio Box */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-secondary/30 p-6 flex items-center gap-5">
            <div className="h-14 w-14 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-xl shrink-0 font-mono">
              SP
            </div>
            <div>
              <h4 className="text-base font-bold text-text">{authorName}</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Software Engineering student at the University of Colombo. Building systems across software development, AI, networking, 3D WebGL graphics, and developer tools.
              </p>
            </div>
          </div>

          {/* Related Articles Navigation */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-2 font-display">
                <span className="text-accent">Related</span> Articles
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((rel, idx) => (
                  <GlowCard key={rel.slug || idx} className="p-6 border-white/10" index={idx}>
                    <span className="text-xs font-mono uppercase text-accent tracking-wider">{rel.category}</span>
                    <h4 className="mt-2 text-lg font-bold text-text line-clamp-2">{rel.title}</h4>
                    <p className="mt-2 text-xs text-text-muted line-clamp-2">{rel.excerpt}</p>
                    <Link
                      to={`/blog/${rel.slug || slugify(rel.title)}`}
                      className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-accent"
                    >
                      Read Article <ArrowRight size={12} />
                    </Link>
                  </GlowCard>
                ))}
              </div>
            </div>
          )}
        </article>
      </PageShell>
    </>
  );
};

export default BlogPostPage;

