import React from 'react';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';

const DEFAULT_SITE_URL = 'https://www.sahanpramuditha.me';

const normalizeSiteUrl = (rawUrl) => {
  if (!rawUrl) return DEFAULT_SITE_URL;
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
};

const StructuredData = () => {
  const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL);
  const { data: siteDoc } = useCmsDoc(CMS_DOCS.site, null);
  const socialLinks = Array.isArray(siteDoc?.socialLinksJson) ? siteDoc.socialLinksJson : [];
  const sameAs = socialLinks.map((link) => link.href).filter(Boolean);
  const alumniOf = Array.isArray(siteDoc?.educationJson) && siteDoc.educationJson.length > 0
    ? siteDoc.educationJson[0].institution
    : 'University of Colombo - Faculty of Technology';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": siteDoc?.heroTitle || "Sahan Pramuditha",
    "jobTitle": siteDoc?.heroSubtitle || "Software Engineer & Creative Developer",
    "url": siteUrl,
    "sameAs": sameAs,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "LK",
      "addressLocality": "Sri Lanka"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": alumniOf
    },
    "knowsAbout": [
      "Software Engineering",
      "Web Development",
      "React",
      "Three.js",
      "Full-Stack Development"
    ]
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": `${siteDoc?.heroTitle || 'Sahan Pramuditha'} Portfolio`,
    "url": siteUrl,
    "author": {
      "@type": "Person",
      "name": siteDoc?.heroTitle || "Sahan Pramuditha"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
    </>
  );
};

export default StructuredData;
