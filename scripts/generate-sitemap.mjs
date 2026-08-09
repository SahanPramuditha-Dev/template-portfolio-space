import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BLOG_POSTS } from '../src/data/blogPosts.js';

const root = process.cwd();
const siteUrl = (process.env.VITE_SITE_URL || 'https://sahanpramuditha.me').replace(/\/+$/, '');
const today = new Date().toISOString().slice(0, 10);

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/resume', changefreq: 'monthly', priority: '0.9' },
  { path: '/resources', changefreq: 'monthly', priority: '0.6' },
  { path: '/testimonials', changefreq: 'monthly', priority: '0.6' },
  { path: '/services', changefreq: 'monthly', priority: '0.7' },
  { path: '/opensource', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/cookies', changefreq: 'yearly', priority: '0.3' },
];

const readOptionalJson = (relativePath) => {
  const filePath = resolve(root, relativePath);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
};

const cmsExport =
  readOptionalJson('public/cms-sitemap.json') ||
  readOptionalJson('sitemap.dynamic.json') ||
  {};

const projectRoutes = (cmsExport.projects || cmsExport.projectItems || [])
  .map((item) => slugify(item.slug || item.id || item.title || item.missionCode))
  .filter(Boolean)
  .map((slug) => ({ path: `/projects/${slug}`, changefreq: 'monthly', priority: '0.8' }));

const cmsBlogPosts = cmsExport.blog || cmsExport.posts || [];
const combinedBlogPosts = cmsBlogPosts.length > 0 ? cmsBlogPosts : BLOG_POSTS;

const blogRoutes = combinedBlogPosts
  .map((item) => slugify(item.slug || item.title))
  .filter(Boolean)
  .map((slug) => ({ path: `/blog/${slug}`, changefreq: 'monthly', priority: '0.7' }));

const seen = new Set();
const routes = [...staticRoutes, ...projectRoutes, ...blogRoutes].filter((route) => {
  if (seen.has(route.path)) return false;
  seen.add(route.path);
  return true;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(resolve(root, 'public/sitemap.xml'), xml);
console.log(`Generated sitemap with ${routes.length} URLs.`);
