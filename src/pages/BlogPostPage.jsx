import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ChevronLeft, Code2 } from 'lucide-react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import PageLoader from '../components/PageLoader';

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
  const posts = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data]);
  const post = posts.find((item) => (item.slug || slugify(item.title)) === slug) || null;

  if (loading || data === undefined) {
    return (
      <>
        <SEO title="Blog | Sahan Pramuditha" description="Loading article…" canonicalPath={`/blog/${slug || ''}`} />
        <PageLoader text="Loading article" subtext="Loading post content..." />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <SEO title="Post not found | Sahan Pramuditha" description="The requested blog post could not be found." canonicalPath={`/blog/${slug || ''}`} noindex />
        <PageShell
          eyebrow="Blog"
          title="Post not found"
          description="That article isn’t published yet or the slug is wrong."
          backHref="/blog"
        >
          <div className="rounded-3xl border border-white/10 bg-secondary/20 p-10 text-center text-text-muted">
            Try a different post from the blog index.
          </div>
        </PageShell>
      </>
    );
  }

  const title = post.title || 'Blog post';
  const description = post.excerpt || String(post.body || '').slice(0, 160);
  const canonicalPath = `/blog/${post.slug || slugify(post.title)}`;

  return (
    <>
      <SEO title={`${title} | Sahan Pramuditha`} description={description} canonicalPath={canonicalPath} />
      <PageShell
        eyebrow="Dev Writing"
        title={title}
        description={description}
        backHref="/blog"
      >
        <article className="rounded-3xl border border-white/10 bg-secondary/20 p-6 backdrop-blur-md">
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

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} />
              {post.date || 'Draft'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} />
              {post.readTime || '5 min read'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Code2 size={14} />
              {post.language || 'text'}
            </span>
          </div>

          <div className="mt-6 space-y-6 text-text-muted">
            <p className="text-lg leading-relaxed text-text">{post.excerpt}</p>
            {post.body && <div className="whitespace-pre-line leading-relaxed">{post.body}</div>}
            {post.codeSnippet && (
              <pre className="overflow-x-auto rounded-2xl border border-accent/20 bg-primary/80 p-4 text-sm text-accent">
                <code>{post.codeSnippet}</code>
              </pre>
            )}
            <div className="flex flex-wrap gap-2">
              {splitCsv(post.tags).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-secondary/40 bg-primary/50 px-3 py-1 text-xs text-text-muted">
                  <Tag size={11} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      </PageShell>
    </>
  );
};

export default BlogPostPage;
