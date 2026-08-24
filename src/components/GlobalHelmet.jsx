import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const GlobalHelmet = () => {
  const { data: siteDoc, loading } = useCmsDoc(CMS_DOCS.site, null);

  if (loading || !siteDoc) return null;

  return (
    <Helmet>
      <title>{siteDoc.seoTitle || 'Sahan Pramuditha'}</title>
      <meta name="description" content={siteDoc.seoDescription || ''} />
      <link
        rel="icon"
        href="/favicon.png?v=2026-08-24"
        sizes="any"
      />
      <link
        rel="shortcut icon"
        href="/favicon.ico?v=2026-08-24"
        type="image/x-icon"
      />
      {siteDoc.seoImage && (
        <meta property="og:image" content={siteDoc.seoImage} />
      )}
      {siteDoc.seoTitle && (
        <meta property="og:title" content={siteDoc.seoTitle} />
      )}
      {siteDoc.seoDescription && (
        <meta property="og:description" content={siteDoc.seoDescription} />
      )}
    </Helmet>
  );
};

export default GlobalHelmet;
