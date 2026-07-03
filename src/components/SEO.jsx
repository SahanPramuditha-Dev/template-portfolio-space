import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_SITE_URL = 'https://www.sahanpramuditha.me';

const normalizeSiteUrl = (rawUrl) => {
  if (!rawUrl) return DEFAULT_SITE_URL;
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
};

const SEO = ({
  title = 'Sahan Pramuditha | Software Engineer and Creative Developer',
  description = 'Sahan Pramuditha is a software engineer and creative developer building accessible, high-performance digital experiences.',
  canonicalPath = '/',
  ogImage = null,
  noindex = false,
} = {}) => {
  const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL);
  const canonicalUrl = canonicalPath.startsWith('http')
    ? canonicalPath
    : `${siteUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  const resolvedOgImage = ogImage
    ? (String(ogImage).startsWith('http') ? ogImage : `${siteUrl}${String(ogImage).startsWith('/') ? ogImage : `/${ogImage}`}`)
    : `${siteUrl}/og-image.svg`;
  const twitterHandle = '@sahanpramuditha';
  const keywords = 'Sahan Pramuditha, software engineer, creative developer, web developer, React developer, portfolio, Three.js';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Sahan Pramuditha" />
      <meta name="application-name" content="Sahan Pramuditha" />
      <meta name="creator" content="Sahan Pramuditha" />
      <meta name="publisher" content="Sahan Pramuditha" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Sahan Pramuditha" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
    </Helmet>
  );
};

export default SEO;
