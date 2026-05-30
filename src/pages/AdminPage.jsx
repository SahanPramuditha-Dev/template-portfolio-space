import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  ArrowLeft,
  LogIn,
  LogOut,
  Shield,
  Folder,
  Award,
  Wrench,
  Link as LinkIcon,
  FileText,
  Upload,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Settings2,
  Image as ImageIcon,
  AlertTriangle,
  BookOpen,
  Quote,
  Briefcase,
  Github,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
} from 'lucide-react';
import {
  CMS_DOCS,
  loginWithEmail,
  logout,
  saveCmsDoc,
  uploadCmsAsset,
  useAuthState,
  useCmsDoc,
} from '../lib/cms';

const initialSiteContent = {
  heroTitle: 'Sahan Pramuditha',
  heroSubtitle: 'Software Engineer & Creative Developer',
  heroIntro:
    'I build accessible, high-performance digital experiences with strong visual direction and practical engineering decisions.',
  heroWordsJson: JSON.stringify(
    ['Web Applications.', 'Digital Experiences.', 'Accessible Products.', 'User Interfaces.'],
    null,
    2
  ),
  currentLearningJson: JSON.stringify(['TypeScript', 'System Design', 'Test automation'], null, 2),
  devEnvironmentJson: JSON.stringify(['VS Code', 'Linux terminal', 'Figma', 'Postman'], null, 2),
  careerGoalsJson: JSON.stringify(
    ['Frontend engineer', 'Full-stack product builder', 'Freelance consultant'],
    null,
    2
  ),
  hobbiesJson: JSON.stringify(['Open source', 'CTFs', 'UI experiments', 'Music'], null, 2),
  educationJson: JSON.stringify(
    [
      {
        institution: 'University of Colombo',
        program: 'BSc in Computer Science',
        period: '2023 - Present',
        note: 'Focused on software engineering, systems, and product development.',
      },
      {
        institution: 'Online Learning',
        program: 'Web Development & Cloud Basics',
        period: 'Ongoing',
        note: 'Supplementing coursework with practical front-end, backend, and deployment experience.',
      },
    ],
    null,
    2
  ),
  availability: 'Open to freelance, part-time, and select full-time roles.',
  contactEmail: 'contact@sahanpramuditha.com',
  preferredContact: 'Email is best for detailed project discussions.',
  responseSla: 'Usually replies within 1-2 business days.',
  bookingUrl: '',
  cvVersion: 'v1.0',
  cvUpdatedAt: new Date().toISOString().slice(0, 10),
  resumeUrl: '/resume.pdf',
  githubUsername: 'SahanPramuditha-Dev',
  profilePhotoUrl: '',
  heroArtworkUrl: '',
  aboutParagraphs:
    'Hello! My name is Sahan and I enjoy creating things that live on the internet.\nFast-forward to today, and I’ve had the privilege of building software for a variety of clients.\nI also manage Wybe.lk, overseeing end-to-end e-commerce operations and platform reliability.\nI am currently a student at University Of Colombo who is constantly learning and evolving my skills.',
  aboutStatsJson: JSON.stringify(
    [
      { label: 'Years Experience', value: 2, suffix: '+' },
      { label: 'Projects Completed', value: 5, suffix: '+' },
      { label: 'Lines of Code', value: 25, suffix: 'k+' },
      { label: 'Happy Clients', value: 5, suffix: '+' },
    ],
    null,
    2
  ),
  engineeringApproachJson: JSON.stringify(
    [
      {
        title: 'Scalable Architecture',
        description:
          'I design systems that grow. Prioritizing modularity, microservices when needed, and efficient database schemas to handle increasing loads without technical debt.',
      },
      {
        title: 'Clean & Maintainable',
        description:
          'Code is read more than it is written. I follow SOLID principles, write self-documenting code, and keep the codebase easy to evolve.',
      },
      {
        title: 'User-Centric Design',
        description:
          'Performance and accessibility are never afterthoughts. I build inclusive interfaces that load fast and feel effortless to use.',
      },
    ],
    null,
    2
  ),
  footerTagline: 'Building digital experiences with pixel-perfect precision and interactive magic.',
  footerEmail: 'contact@sahanpramuditha.com',
  socialLinksJson: JSON.stringify(
    [
      { label: 'GitHub', href: 'https://github.com/SahanPramuditha-Dev' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sahan-pramuditha-754761356' },
      { label: 'Facebook', href: 'https://www.facebook.com/share/1MdpoJ9nBa/' },
      { label: 'Email', href: 'mailto:contact@sahanpramuditha.com' },
    ],
    null,
    2
  ),
};

const initialExperienceItem = {
  type: 'work',
  title: '',
  organization: '',
  location: '',
  period: '',
  description: '',
  skills: [],
};

const getAuthErrorMessage = (error) => {
  if (!(error instanceof Error)) {
    return 'Login failed.';
  }

  switch (error.code) {
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled in Firebase Authentication. Enable it in the Firebase console, then try again.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    default:
      return error.message || 'Login failed.';
  }
};

const getCmsErrorMessage = (error) => {
  if (!(error instanceof Error)) {
    return 'Failed to save content.';
  }

  if (error.code === 'permission-denied') {
    return 'Firestore blocked the save. Sign in with the owner account or add this email to the admins collection.';
  }

  return error.message || 'Failed to save content.';
};

const isLikelyAssetUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return true;
  if (raw.startsWith('/')) return true;
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const collectMediaValidationErrors = (item, fields) => {
  const errors = [];

  fields.forEach((field) => {
    if ((field.type === 'image' || field.type === 'file') && item[field.key] && !isLikelyAssetUrl(item[field.key])) {
      errors.push(`${field.label} must be a valid URL or root-relative path.`);
    }

    if (field.type !== 'object-list' || !Array.isArray(item[field.key])) return;

    item[field.key].forEach((entry, index) => {
      field.fields?.forEach((nestedField) => {
        const value = entry?.[nestedField.key];
        if ((nestedField.type === 'image' || nestedField.type === 'file') && value && !isLikelyAssetUrl(value)) {
          errors.push(`${field.label} #${index + 1} ${nestedField.label} must be a valid URL or root-relative path.`);
        }
      });

      if (field.key === 'screenshots' && entry?.url && !String(entry.alt || '').trim()) {
        errors.push(`${field.label} #${index + 1} needs alt text before publishing.`);
      }
    });
  });

  return errors;
};

const initialProject = {
  missionCode: '',
  year: new Date().getFullYear(),
  title: '',
  shortDescription: '',
  description: '',
  architecture: '',
  features: [],
  learned: '',
  impactMetricsJson: [],
  tech: [],
  tags: [],
  category: 'Web Apps',
  github: '',
  external: '',
  thumbnail: '',
  screenshots: [],
  problem: '',
  solution: '',
  role: '',
  client: '',
  industry: '',
  teamSize: '',
  projectTimeline: '',
  status: 'Live',
  outcomeBadge: '',
  videoUrl: '',
  videoCaption: '',
  lessonsLearned: '',
  nextSteps: '',
  challenges: '',
  outcomes: '',
  featured: false,
};

const initialCertificate = {
  title: '',
  issuer: '',
  date: '',
  credential: '',
  link: '',
  skills: '',
  image: '',
};

const initialSkillGroup = {
  title: '',
  order: 0,
  skillsJson: [],
};

const initialResource = {
  title: '',
  type: 'Link',
  url: '',
  description: '',
  category: '',
};

const initialBlogPost = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  codeSnippet: '',
  language: 'text',
  tags: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  readTime: '5 min read',
  link: '',
  featured: false,
};

const initialTestimonial = {
  name: '',
  role: '',
  company: '',
  content: '',
  rating: 5,
  context: '',
  link: '',
};

const initialService = {
  title: '',
  summary: '',
  scope: '',
  timeline: '',
  deliverables: '',
  cta: '',
  featured: false,
};

const initialOpenSource = {
  name: '',
  description: '',
  repository: '',
  stars: 0,
  forks: 0,
  watchers: 0,
  category: '',
  status: 'Active',
};

const AdminStatus = ({ message }) => {
  if (!message) return null;
  const lower = message.toLowerCase();
  const isError =
    lower.includes('failed') ||
    lower.includes('denied') ||
    lower.includes('incorrect') ||
    lower.includes('invalid') ||
    lower.includes('blocked');
  const isSuccess =
    lower.includes('saved') || lower.includes('uploaded') || lower.includes('deleted') || lower.includes('ready');

  return (
    <div
      role="status"
      className={clsx(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        isError && 'border-red-400/35 bg-red-400/10 text-red-100',
        isSuccess && !isError && 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100',
        !isError && !isSuccess && 'border-accent/25 bg-accent/5 text-text-muted'
      )}
    >
      {isError ? (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden />
      ) : isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
      ) : null}
      <span>{message}</span>
    </div>
  );
};

const SiteSection = ({ title, description, children }) => (
  <section className="space-y-4 rounded-2xl border border-white/10 bg-primary/25 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
    <header className="border-b border-white/10 pb-4">
      <h3 className="font-display text-lg font-semibold tracking-tight text-text">{title}</h3>
      {description && <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-text-muted">{description}</p>}
    </header>
    <div className="space-y-4">{children}</div>
  </section>
);

const sectionConfig = {
  [CMS_DOCS.projects]: {
    title: 'Projects',
    icon: Folder,
    collectionKey: 'items',
    initialItem: initialProject,
    uploadFolder: 'projects',
    help: 'Manage portfolio projects, case-study content, and quick links.',
  },
  [CMS_DOCS.certifications]: {
    title: 'Certificates',
    icon: Award,
    collectionKey: 'items',
    initialItem: initialCertificate,
    uploadFolder: 'certificates',
    help: 'Manage certs, issuers, and verification links.',
  },
  [CMS_DOCS.skills]: {
    title: 'Skills',
    icon: Wrench,
    collectionKey: 'items',
    initialItem: initialSkillGroup,
    uploadFolder: null,
    help: 'Manage skill groups with card-style skill details.',
  },
  [CMS_DOCS.experience]: {
    title: 'Experience',
    icon: Sparkles,
    collectionKey: 'items',
    initialItem: initialExperienceItem,
    uploadFolder: null,
    help: 'Manage work history and education entries shown on the timeline.',
  },
  [CMS_DOCS.resources]: {
    title: 'Resources',
    icon: LinkIcon,
    collectionKey: 'items',
    initialItem: initialResource,
    uploadFolder: 'resources',
    help: 'Manage external links, docs, and resource pages.',
  },
  [CMS_DOCS.blog]: {
    title: 'Blog',
    icon: BookOpen,
    collectionKey: 'items',
    initialItem: initialBlogPost,
    uploadFolder: null,
    help: 'Manage articles, tutorials, and case studies.',
  },
  [CMS_DOCS.testimonials]: {
    title: 'Testimonials',
    icon: Quote,
    collectionKey: 'items',
    initialItem: initialTestimonial,
    uploadFolder: null,
    help: 'Manage peer, mentor, and client recommendations.',
  },
  [CMS_DOCS.services]: {
    title: 'Services',
    icon: Briefcase,
    collectionKey: 'items',
    initialItem: initialService,
    uploadFolder: null,
    help: 'Manage your freelance offerings and delivery scope.',
  },
  [CMS_DOCS.openSource]: {
    title: 'Open Source',
    icon: Github,
    collectionKey: 'items',
    initialItem: initialOpenSource,
    uploadFolder: null,
    help: 'Manage your external OSS packages and contributions.',
  },
};

const toFormValue = (field, value) => {
  if (field.type === 'list') {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return raw
          .split('\n')
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    }
    return [];
  }
  if (field.type === 'object-list') {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }
  if (field.type === 'csv') {
    return Array.isArray(value) ? value.join(', ') : (value || '');
  }
  if (field.type === 'json') {
    if (typeof value === 'string') return value;
    return JSON.stringify(value ?? [], null, 2);
  }
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'number') return value ?? 0;
  return value ?? '';
};

const fromFormValue = (field, value) => {
  if (field.type === 'list') {
    if (Array.isArray(value)) {
      return value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
    }
    return String(value || '')
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (field.type === 'object-list') {
    const arr = Array.isArray(value) ? value : [];
    if (field.key === 'screenshots') {
      return arr
        .map((row) => ({
          url: String(row?.url ?? '').trim(),
          caption: String(row?.caption ?? '').trim(),
          alt: String(row?.alt ?? '').trim(),
        }))
        .filter((row) => row.url);
    }
    return arr;
  }
  if (field.type === 'csv') {
    return String(value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (field.type === 'json') {
    const raw = String(value || '').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  }
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'number') return Number(value || 0);
  return value;
};

const projectFields = [
  { key: 'missionCode', label: 'Mission Code', type: 'text', group: 'summary' },
  { key: 'year', label: 'Year', type: 'number', group: 'summary' },
  { key: 'title', label: 'Title', type: 'text', group: 'summary' },
  { key: 'shortDescription', label: 'Short Description', type: 'textarea', group: 'summary' },
  { key: 'tech', label: 'Tech Stack', type: 'list', placeholder: 'Enter a technology', group: 'summary' },
  { key: 'tags', label: 'Tags', type: 'list', placeholder: 'Enter a tag', group: 'summary' },
  { key: 'category', label: 'Category', type: 'text', group: 'summary' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['In progress', 'Live', 'Archived'],
    group: 'summary',
  },
  { key: 'client', label: 'Client / company', type: 'text', group: 'summary' },
  { key: 'industry', label: 'Industry', type: 'text', group: 'summary' },
  { key: 'teamSize', label: 'Team size', type: 'text', group: 'summary', placeholder: 'e.g. 3 engineers' },
  { key: 'projectTimeline', label: 'Timeline / duration', type: 'text', group: 'summary', placeholder: 'e.g. 6 months · Q1–Q3 2024' },
  { key: 'outcomeBadge', label: 'Outcome badge (short)', type: 'text', group: 'summary', placeholder: 'e.g. Reduced load by 40%' },
  { key: 'featured', label: 'Featured Project', type: 'checkbox', group: 'summary' },
  { key: 'description', label: 'Description', type: 'textarea', group: 'story' },
  { key: 'architecture', label: 'Architecture', type: 'textarea', group: 'story' },
  { key: 'features', label: 'Features', type: 'list', placeholder: 'Enter a feature', group: 'story' },
  { key: 'learned', label: 'What I Learned', type: 'textarea', group: 'story' },
  { key: 'problem', label: 'Problem Statement', type: 'textarea', group: 'story' },
  { key: 'solution', label: 'Solution', type: 'textarea', group: 'story' },
  { key: 'role', label: 'Role', type: 'text', group: 'story' },
  { key: 'lessonsLearned', label: 'Lessons learned (case study)', type: 'textarea', group: 'story' },
  { key: 'nextSteps', label: 'Next steps', type: 'textarea', group: 'story' },
  { key: 'challenges', label: 'Challenges', type: 'textarea', group: 'story' },
  { key: 'outcomes', label: 'Outcomes', type: 'textarea', group: 'story' },
  {
    key: 'impactMetricsJson',
    label: 'Impact Metrics',
    type: 'object-list',
    group: 'metrics',
    createItem: () => ({ label: '', value: '', suffix: '' }),
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'value', label: 'Value', type: 'text' },
      { key: 'suffix', label: 'Suffix', type: 'text' },
    ],
  },
  { key: 'github', label: 'GitHub URL', type: 'text', group: 'links' },
  { key: 'external', label: 'Live Demo URL', type: 'text', group: 'links' },
  { key: 'videoUrl', label: 'Video preview URL (mp4/webm)', type: 'text', group: 'media' },
  { key: 'videoCaption', label: 'Video caption', type: 'text', group: 'media' },
  { key: 'thumbnail', label: 'Thumbnail URL', type: 'image', group: 'media' },
  {
    key: 'screenshots',
    label: 'Screenshots & motion',
    type: 'object-list',
    group: 'media',
    helper: 'URL, optional caption for the modal gallery, and alt text for accessibility.',
    createItem: () => ({ url: '', caption: '', alt: '' }),
    fields: [
      { key: 'url', label: 'Image or video URL', type: 'image' },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'alt', label: 'Alt text', type: 'text' },
    ],
  },
];

const certificateFields = [
  { key: 'title', label: 'Title', type: 'text', group: 'identity' },
  { key: 'issuer', label: 'Issuer', type: 'text', group: 'identity' },
  { key: 'date', label: 'Date', type: 'text', group: 'identity' },
  { key: 'credential', label: 'Credential', type: 'text', group: 'identity' },
  { key: 'link', label: 'Verification Link', type: 'text', group: 'identity' },
  { key: 'skills', label: 'Skills', type: 'list', placeholder: 'Enter a skill', group: 'identity' },
  { key: 'image', label: 'Image URL', type: 'image', group: 'media' },
];

const skillFields = [
  { key: 'title', label: 'Group Title', type: 'text', group: 'summary' },
  { key: 'order', label: 'Order', type: 'number', group: 'summary' },
  {
    key: 'skillsJson',
    label: 'Skills',
    type: 'object-list',
    group: 'skills',
    createItem: () => ({ name: '', level: 0, proficiency: '', rationale: '', iconUrl: '' }),
    fields: [
      { key: 'name', label: 'Skill Name', type: 'text' },
      { key: 'level', label: 'Level (%)', type: 'number' },
      {
        key: 'proficiency',
        label: 'Proficiency',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Expert'],
      },
      { key: 'iconUrl', label: 'Icon / Image URL', type: 'image' },
      { key: 'rationale', label: 'Rationale', type: 'textarea' },
    ],
  },
];

const resourceFields = [
  { key: 'title', label: 'Title', type: 'text', group: 'resourceMeta' },
  { key: 'type', label: 'Type', type: 'text', group: 'resourceMeta' },
  { key: 'category', label: 'Category', type: 'text', group: 'resourceMeta' },
  { key: 'url', label: 'URL', type: 'text', group: 'resourceLink' },
  { key: 'description', label: 'Description', type: 'textarea', group: 'resourceLink' },
];

const blogFields = [
  { key: 'slug', label: 'Slug', type: 'text', group: 'meta' },
  { key: 'title', label: 'Title', type: 'text', group: 'meta' },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea', group: 'meta' },
  { key: 'tags', label: 'Tags', type: 'list', placeholder: 'Enter a tag', group: 'meta' },
  { key: 'category', label: 'Category', type: 'text', group: 'meta' },
  { key: 'date', label: 'Publish Date', type: 'text', group: 'meta' },
  { key: 'readTime', label: 'Read Time', type: 'text', group: 'meta' },
  { key: 'featured', label: 'Featured Post', type: 'checkbox', group: 'meta' },
  { key: 'body', label: 'Body', type: 'textarea', group: 'content' },
  { key: 'codeSnippet', label: 'Code Snippet', type: 'textarea', group: 'content' },
  { key: 'language', label: 'Language', type: 'text', group: 'content' },
  { key: 'link', label: 'Canonical/External Link', type: 'text', group: 'links' },
];

const testimonialFields = [
  { key: 'name', label: 'Name', type: 'text', group: 'author' },
  { key: 'role', label: 'Role', type: 'text', group: 'author' },
  { key: 'company', label: 'Company', type: 'text', group: 'author' },
  { key: 'content', label: 'Quote', type: 'textarea', group: 'testimonialBody' },
  { key: 'rating', label: 'Rating', type: 'number', group: 'testimonialBody' },
  { key: 'context', label: 'Context', type: 'text', group: 'testimonialBody' },
  { key: 'link', label: 'Link', type: 'text', group: 'testimonialBody' },
];

const serviceFields = [
  { key: 'title', label: 'Title', type: 'text', group: 'serviceOffer' },
  { key: 'summary', label: 'Summary', type: 'textarea', group: 'serviceOffer' },
  { key: 'featured', label: 'Featured', type: 'checkbox', group: 'serviceOffer' },
  { key: 'scope', label: 'Scope', type: 'textarea', group: 'serviceDelivery' },
  { key: 'timeline', label: 'Timeline', type: 'text', group: 'serviceDelivery' },
  { key: 'deliverables', label: 'Deliverables', type: 'textarea', group: 'serviceDelivery' },
  { key: 'cta', label: 'CTA', type: 'text', group: 'serviceDelivery' },
];

const openSourceFields = [
  { key: 'name', label: 'Project Name', type: 'text', group: 'identity' },
  { key: 'description', label: 'Description', type: 'textarea', group: 'identity' },
  { key: 'repository', label: 'Repository URL', type: 'text', group: 'identity' },
  { key: 'category', label: 'Category', type: 'text', group: 'identity' },
  { key: 'status', label: 'Status', type: 'text', group: 'identity' },
  { key: 'stars', label: 'Stars', type: 'number', group: 'stats' },
  { key: 'forks', label: 'Forks', type: 'number', group: 'stats' },
  { key: 'watchers', label: 'Watchers', type: 'number', group: 'stats' },
];

const COLLECTION_FIELD_GROUPS = {
  summary: {
    label: 'Summary & classification',
    hint: 'What appears on cards, filters, and list views.',
  },
  story: {
    label: 'Case study & narrative',
    hint: 'Long-form content shown in the project modal.',
  },
  metrics: { label: 'Impact metrics', hint: 'Optional headline numbers.' },
  links: { label: 'Outbound links', hint: 'Demo and source URLs.' },
  media: { label: 'Media', hint: 'Thumbnails, GIFs, and screenshots.' },
  meta: {
    label: 'Metadata & publishing',
    hint: 'Slug, dates, categories, and flags.',
  },
  content: { label: 'Article body', hint: 'Main text and optional code block.' },
  identity: { label: 'Basics', hint: 'Names, titles, and verification.' },
  stats: { label: 'Repository stats', hint: 'Stars, forks, and watchers.' },
  skills: { label: 'Skill entries', hint: 'Cards inside this group.' },
  resourceMeta: { label: 'Listing', hint: 'How this resource appears in lists.' },
  resourceLink: { label: 'URL & description', hint: 'Link target and optional blurb.' },
  author: { label: 'Author', hint: 'Who the testimonial is from.' },
  testimonialBody: { label: 'Quote & details', hint: 'Quote text, rating, and references.' },
  serviceOffer: { label: 'Offer headline', hint: 'Title, pitch, and featured flag.' },
  serviceDelivery: { label: 'Scope & delivery', hint: 'What you deliver and how to engage.' },
  role: { label: 'Role & place', hint: 'Title, organization, location, and timeframe.' },
  detail: { label: 'Story & skills', hint: 'Description and skill tags.' },
  general: { label: 'Fields', hint: '' },
};

const experienceFields = [
  { key: 'type', label: 'Type', type: 'text', group: 'role' },
  { key: 'title', label: 'Title', type: 'text', group: 'role' },
  { key: 'organization', label: 'Organization', type: 'text', group: 'role' },
  { key: 'location', label: 'Location', type: 'text', group: 'role' },
  { key: 'period', label: 'Period', type: 'text', group: 'role' },
  { key: 'description', label: 'Description', type: 'textarea', group: 'detail' },
  { key: 'skills', label: 'Skills', type: 'list', placeholder: 'Enter a skill', group: 'detail' },
];

const FieldGroups = ({ fields, renderField }) => {
  const { order, map } = useMemo(() => {
    const ord = [];
    const m = new Map();
    fields.forEach((field) => {
      const id = field.group || 'general';
      if (!m.has(id)) {
        m.set(id, []);
        ord.push(id);
      }
      m.get(id).push(field);
    });
    return { order: ord, map: m };
  }, [fields]);

  return (
    <div className="space-y-3">
      {order.map((groupId, index) => {
        const groupFields = map.get(groupId);
        const meta = COLLECTION_FIELD_GROUPS[groupId] || COLLECTION_FIELD_GROUPS.general;
        return (
          <details
            key={groupId}
            open={index === 0}
            className="rounded-2xl border border-white/10 bg-primary/20 open:border-accent/30 open:bg-primary/35"
          >
            <summary className="cursor-pointer list-none rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-semibold text-text">{meta.label}</p>
                  {meta.hint ? <p className="mt-1 text-xs text-text-muted">{meta.hint}</p> : null}
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-primary/40 px-2.5 py-0.5 text-[11px] font-mono text-text-muted">
                  {groupFields.length}
                </span>
              </div>
            </summary>
            <div className="grid gap-5 border-t border-white/10 px-4 pb-5 pt-4">
              {groupFields.map((field) => renderField(field))}
            </div>
          </details>
        );
      })}
    </div>
  );
};

const SectionBanner = ({ icon, title, help, onAdd, onSave, onReset, onUpload, hidePrimarySave = false }) => {
  const SectionIcon = icon;
  return (
    <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-accent/25 bg-accent/10 p-3.5 text-accent shadow-[0_0_24px_rgb(var(--color-accent-rgb)/0.12)]">
          <SectionIcon size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold tracking-tight text-text">{title}</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-muted">{help}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-primary/40 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/35 hover:bg-primary/60"
          >
            <Upload size={16} />
            Upload
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-primary/40 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/35"
          >
            <ArrowLeft size={16} />
            Reset draft
          </button>
        )}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/15 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/25"
          >
            <Plus size={16} />
            Add new
          </button>
        )}
        {!hidePrimarySave && (
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-[0_4px_20px_rgb(var(--color-accent-rgb)/0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save size={16} />
            Save
          </button>
        )}
      </div>
    </div>
  );
};

const FieldEditor = ({ field, value, onChange, onUpload, section, docId }) => {
  const fieldId = `admin-field-${field.key}`;

  if (field.type === 'checkbox') {
    return (
      <label
        htmlFor={fieldId}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-primary/30 px-4 py-3.5 transition-colors hover:border-accent/25"
      >
        <input
          id={fieldId}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-secondary/50 text-accent focus:ring-accent"
        />
        <span className="text-sm font-medium text-text">{field.label}</span>
      </label>
    );
  }

  if (field.type === 'list') {
    return (
      <RepeatableTextEditor
        label={field.label}
        helper={field.helper || 'Add one item per row.'}
        placeholder={field.placeholder || 'Enter an item'}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
      />
    );
  }

  if (field.type === 'object-list') {
    const needsNestedUpload = field.fields?.some((f) => f.type === 'image');
    const uploadForObjectList =
      needsNestedUpload && section && docId
        ? async (_nestedKey, accept = 'image/*,.gif,.mp4,.webm') =>
            new Promise((resolve) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = accept;
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) {
                  resolve(null);
                  return;
                }
                try {
                  const url = await uploadCmsAsset(file, `${section.uploadFolder || 'uploads'}/${docId}`);
                  resolve(url);
                } catch (error) {
                  console.error('Upload failed:', error);
                  resolve(null);
                }
              };
              input.click();
            })
        : null;

    return (
      <RepeatableObjectEditor
        label={field.label}
        helper={field.helper || 'Add one card per entry.'}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        createItem={field.createItem || (() => ({}))}
        fields={field.fields || []}
        onUpload={uploadForObjectList}
      />
    );
  }

  const commonClass =
    'w-full rounded-xl border border-white/10 bg-primary/40 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent/40';

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        {field.label}
      </label>
      {field.type === 'select' ? (
        <select
          id={fieldId}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={commonClass}
        >
          <option value="" disabled>
            Select {field.label.toLowerCase()}
          </option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' || field.type === 'json' ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.type === 'json' ? 8 : 4}
          className={`${commonClass} font-mono text-sm`}
        />
      ) : (
        <div className="flex gap-2">
          <input
            id={fieldId}
            type={field.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={commonClass}
          />
          {(field.type === 'image' || field.type === 'file') && onUpload && (
            <button
              type="button"
              onClick={onUpload}
              className="shrink-0 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-accent"
              aria-label={`Upload ${field.label}`}
            >
              {field.type === 'file' ? <FileText size={16} /> : <ImageIcon size={16} />}
            </button>
          )}
        </div>
      )}
      {field.type === 'csv' && <p className="text-xs text-text-muted">Separate values with commas.</p>}
      {field.type === 'json' && <p className="text-xs text-text-muted">Must be valid JSON.</p>}
    </div>
  );
};

const DraftPreview = ({ draft, fields, title }) => {
  if (!draft) return null;

  const primary = draft.title || draft.name || draft.program || draft.url || 'Untitled draft';
  const meta = [draft.category, draft.type, draft.issuer, draft.organization, draft.status]
    .filter(Boolean)
    .slice(0, 2)
    .join(' / ');
  const body = draft.shortDescription || draft.summary || draft.description || draft.excerpt || draft.content || '';
  const tags = ['tech', 'tags', 'skills']
    .flatMap((key) => (Array.isArray(draft[key]) ? draft[key] : []))
    .slice(0, 8);
  const imageField = fields.find((field) => field.type === 'image' && draft[field.key]);
  const imageUrl = imageField ? draft[imageField.key] : '';

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-accent">Live card preview</p>
          <h3 className="mt-1 text-lg font-bold text-text">{title}</h3>
        </div>
        <Eye size={18} className="text-accent" aria-hidden />
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-primary/40">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-36 w-full object-cover" />
        ) : (
          <div className="flex h-28 items-center justify-center bg-secondary/30 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">
            No media selected
          </div>
        )}
        <div className="p-4">
          {meta ? <p className="mb-2 text-xs font-mono uppercase tracking-[0.14em] text-accent">{meta}</p> : null}
          <h4 className="text-xl font-bold text-text">{primary}</h4>
          {body ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted">{body}</p> : null}
          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-mono text-accent">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const CollectionEditor = ({ docId, section, fields, collectionKey = 'items' }) => {
  const { data, loading } = useCmsDoc(docId, { [collectionKey]: [] });
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [listQuery, setListQuery] = useState('');

  useEffect(() => {
    if (data === undefined) return;
    const nextItems = Array.isArray(data?.[collectionKey]) ? data[collectionKey] : [];
    setItems(nextItems);
    if (selectedIndex === -1) {
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
    } else if (selectedIndex === null && nextItems.length > 0) {
      setSelectedIndex(0);
      setDraft(formFromItem(nextItems[0], fields, section.initialItem));
    } else if (selectedIndex !== null && nextItems[selectedIndex]) {
      setDraft(formFromItem(nextItems[selectedIndex], fields, section.initialItem));
    } else if (nextItems.length === 0) {
      setSelectedIndex(-1);
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
    }
  }, [data, collectionKey, fields, section.initialItem, selectedIndex]);

  const createNew = () => {
    setSelectedIndex(-1);
    setDraft(formFromItem(section.initialItem, fields, section.initialItem));
    setStatus('New draft ready.');
  };

  const editItem = (index) => {
    setSelectedIndex(index);
    setDraft(formFromItem(items[index], fields, section.initialItem));
  };

  const removeItem = async (index) => {
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    setSelectedIndex(nextItems.length === 0 ? -1 : Math.min(index, nextItems.length - 1));
    setDraft(
      nextItems.length === 0
        ? formFromItem(section.initialItem, fields, section.initialItem)
        : formFromItem(nextItems[Math.min(index, nextItems.length - 1)], fields, section.initialItem)
    );
    await saveCmsDoc(docId, { [collectionKey]: nextItems });
    setStatus('Item deleted.');
  };

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const uploadAsset = async (key, accept = 'image/*,.gif,.mp4,.webm') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        const url = await uploadCmsAsset(file, `${section.uploadFolder || 'uploads'}/${docId}`);
        updateField(key, url);
        setStatus('Media uploaded.');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const saveItem = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const normalized = itemFromForm(draft, fields);
      const validationErrors = collectMediaValidationErrors(normalized, fields);
      if (validationErrors.length > 0) {
        setStatus(`Please fix media before publishing: ${validationErrors.slice(0, 3).join(' ')}`);
        return;
      }
      const nextItems =
        selectedIndex === -1
          ? [normalized, ...items]
          : items.map((item, index) => (index === selectedIndex ? normalized : item));
      setItems(nextItems);
      await saveCmsDoc(docId, { [collectionKey]: nextItems });
      setSelectedIndex(selectedIndex === -1 ? 0 : selectedIndex);
      setStatus('Changes saved.');
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const uploadButtons = useMemo(() => {
    return fields
      .filter((field) => field.type === 'image')
      .map((field) => ({ key: field.key, accept: 'image/*,.gif,.mp4,.webm' }));
  }, [fields]);

  const listEntries = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (!q) return true;
        const primary = String(item.title || item.name || item.url || item.slug || '').toLowerCase();
        const secondary = String(item.category || item.issuer || item.type || item.organization || '').toLowerCase();
        return primary.includes(q) || secondary.includes(q);
      });
  }, [items, listQuery]);

  if (loading || !draft) {
    return (
      <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 text-text-muted">
        Loading {section.title.toLowerCase()}...
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-secondary/25 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <SectionBanner
        icon={section.icon}
        title={section.title}
        help={section.help}
        onAdd={createNew}
        onSave={saveItem}
        onReset={() => setDraft(formFromItem(section.initialItem, fields, section.initialItem))}
        onUpload={
          uploadButtons.length
            ? () => uploadAsset(uploadButtons[0].key, uploadButtons[0].accept)
            : null
        }
      />
      <AdminStatus message={status} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-primary/30 p-3">
            <label className="sr-only" htmlFor={`list-search-${docId}`}>
              Filter {section.title} list
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-primary/50 px-3 py-2">
              <Search size={16} className="shrink-0 text-text-muted" aria-hidden />
              <input
                id={`list-search-${docId}`}
                type="search"
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                placeholder="Filter list…"
                className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
          </div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-primary/25 p-6 text-center text-sm text-text-muted">
              No items yet. Use <span className="text-accent">Add new</span> above to create the first entry.
            </div>
          ) : listEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-primary/25 p-6 text-center text-sm text-text-muted">
              No items match your filter. Clear the search box to see all entries.
            </div>
          ) : (
            <ul className="space-y-2">
              {listEntries.map(({ item, index }) => {
                const key = `${item.title || item.name || item.url || index}-${index}`;
                return (
                  <li key={key}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => editItem(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          editItem(index);
                        }
                      }}
                      className={clsx(
                        'flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                        selectedIndex === index
                          ? 'border-accent/50 bg-accent/10 shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.2)]'
                          : 'border-white/10 bg-primary/30 hover:border-accent/25 hover:bg-primary/45'
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-text">
                          {item.title || item.name || item.url || `Item ${index + 1}`}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {item.category || item.issuer || item.type || item.organization || section.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(index);
                        }}
                        className="shrink-0 rounded-xl border border-red-400/25 p-2 text-red-300 transition-colors hover:bg-red-400/15"
                        aria-label={`Delete ${item.title || `item ${index + 1}`}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-primary/30 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <p className="mb-4 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">Edit selected item</p>
            <p className="mb-5 text-xs text-text-muted">
              Expand a group to edit fields. Nested image uploads use your Storage folder for this section.
            </p>
            <FieldGroups
              fields={fields}
              renderField={(field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={draft[field.key]}
                  onChange={(value) => updateField(field.key, value)}
                  section={section}
                  docId={docId}
                  onUpload={
                    field.type === 'image' || field.type === 'file'
                      ? () => uploadAsset(field.key, field.accept)
                      : undefined
                  }
                />
              )}
            />
          </div>

          <DraftPreview draft={draft} fields={fields} title={section.title} />

          <div className="sticky bottom-2 z-10 rounded-2xl border border-white/10 bg-primary/90 px-4 py-3 backdrop-blur-md sm:bottom-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-text-muted">Save applies the full item, including collapsed groups.</p>
              <button
                type="button"
                onClick={saveItem}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-[0_4px_20px_rgb(var(--color-accent-rgb)/0.2)] transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
              >
                <Save size={16} />
                {busy ? 'Saving…' : 'Save item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formFromItem = (item, fields, initialItem = {}) => {
  const next = {};
  fields.forEach((field) => {
    const raw = item?.[field.key] ?? initialItem[field.key];
    next[field.key] = toFormValue(field, raw);
  });
  return next;
};

const itemFromForm = (draft, fields) => {
  const next = {};
  fields.forEach((field) => {
    next[field.key] = fromFormValue(field, draft[field.key]);
  });
  return next;
};

const parseArrayValue = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }
  return fallback;
};

const normalizeSiteDraft = (source = initialSiteContent) => ({
  heroTitle: source.heroTitle ?? initialSiteContent.heroTitle,
  heroSubtitle: source.heroSubtitle ?? initialSiteContent.heroSubtitle,
  heroIntro: source.heroIntro ?? initialSiteContent.heroIntro,
  heroWordsJson: parseArrayValue(source.heroWordsJson ?? initialSiteContent.heroWordsJson, JSON.parse(initialSiteContent.heroWordsJson)),
  currentLearningJson: parseArrayValue(source.currentLearningJson ?? initialSiteContent.currentLearningJson, JSON.parse(initialSiteContent.currentLearningJson)),
  devEnvironmentJson: parseArrayValue(source.devEnvironmentJson ?? initialSiteContent.devEnvironmentJson, JSON.parse(initialSiteContent.devEnvironmentJson)),
  careerGoalsJson: parseArrayValue(source.careerGoalsJson ?? initialSiteContent.careerGoalsJson, JSON.parse(initialSiteContent.careerGoalsJson)),
  hobbiesJson: parseArrayValue(source.hobbiesJson ?? initialSiteContent.hobbiesJson, JSON.parse(initialSiteContent.hobbiesJson)),
  educationJson: parseArrayValue(source.educationJson ?? initialSiteContent.educationJson, JSON.parse(initialSiteContent.educationJson)),
  availability: source.availability ?? initialSiteContent.availability,
  contactEmail: source.contactEmail ?? initialSiteContent.contactEmail,
  preferredContact: source.preferredContact ?? initialSiteContent.preferredContact,
  responseSla: source.responseSla ?? initialSiteContent.responseSla,
  bookingUrl: source.bookingUrl ?? initialSiteContent.bookingUrl,
  cvVersion: source.cvVersion ?? initialSiteContent.cvVersion,
  cvUpdatedAt: source.cvUpdatedAt ?? initialSiteContent.cvUpdatedAt,
  resumeUrl: source.resumeUrl ?? initialSiteContent.resumeUrl,
  githubUsername: source.githubUsername ?? initialSiteContent.githubUsername,
  profilePhotoUrl: source.profilePhotoUrl ?? initialSiteContent.profilePhotoUrl,
  heroArtworkUrl: source.heroArtworkUrl ?? initialSiteContent.heroArtworkUrl,
  aboutParagraphs: source.aboutParagraphs ?? initialSiteContent.aboutParagraphs,
  aboutStatsJson: parseArrayValue(source.aboutStatsJson ?? initialSiteContent.aboutStatsJson, JSON.parse(initialSiteContent.aboutStatsJson)),
  engineeringApproachJson: parseArrayValue(source.engineeringApproachJson ?? initialSiteContent.engineeringApproachJson, JSON.parse(initialSiteContent.engineeringApproachJson)),
  footerTagline: source.footerTagline ?? initialSiteContent.footerTagline,
  footerEmail: source.footerEmail ?? initialSiteContent.footerEmail,
  socialLinksJson: parseArrayValue(source.socialLinksJson ?? initialSiteContent.socialLinksJson, JSON.parse(initialSiteContent.socialLinksJson)),
});

const stringListConfig = {
  heroWordsJson: { label: 'Hero Words', helper: 'Short phrases shown in the hero typewriter.', placeholder: 'Enter a phrase', variant: 'hero' },
  currentLearningJson: { label: 'Current Learning', helper: 'What you are learning right now.', placeholder: 'Enter a topic' },
  devEnvironmentJson: { label: 'Dev Environment', helper: 'Tools and apps you actually use.', placeholder: 'Enter a tool' },
  careerGoalsJson: { label: 'Career Goals', helper: 'A few goals or directions for your profile.', placeholder: 'Enter a goal' },
  hobbiesJson: { label: 'Hobbies', helper: 'Personal interests shown in About.', placeholder: 'Enter a hobby' },
};

const objectEditorConfigs = {
  educationJson: {
    label: 'Education',
    helper: 'Add one education entry per card.',
    createItem: () => ({ institution: '', program: '', period: '', note: '' }),
    fields: [
      { key: 'institution', label: 'Institution', type: 'text' },
      { key: 'program', label: 'Program', type: 'text' },
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
  },
  aboutStatsJson: {
    label: 'About Stats',
    helper: 'Numbers and labels for the stat cards on About.',
    createItem: () => ({ label: '', value: '', suffix: '' }),
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'value', label: 'Value', type: 'number' },
      { key: 'suffix', label: 'Suffix', type: 'text' },
    ],
  },
  engineeringApproachJson: {
    label: 'Engineering Approach',
    helper: 'Cards that describe how you build.',
    createItem: () => ({ title: '', description: '' }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  socialLinksJson: {
    label: 'Social Links',
    helper: 'Links shown in the hero and footer.',
    createItem: () => ({ label: '', href: '' }),
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'href', label: 'URL', type: 'text' },
    ],
  },
};

const makeEditorRow = (value = '') => ({
  id:
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  value,
});

const RepeatableTextEditor = ({ label, helper, placeholder, value, onChange }) => {
  const items = Array.isArray(value) ? value : [];
  const [rows, setRows] = useState(() => items.map((item) => makeEditorRow(item)));

  useEffect(() => {
    const nextItems = Array.isArray(value) ? value : [];
    // Keep the local row IDs stable when the source array changes externally.
    // This is intentional state syncing for a controlled editor, not an effect side-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows((currentRows) => {
      if (
        currentRows.length === nextItems.length &&
        currentRows.every((row, index) => row.value === (nextItems[index] ?? ''))
      ) {
        return currentRows;
      }

      if (currentRows.length === nextItems.length) {
        return currentRows.map((row, index) => ({
          ...row,
          value: nextItems[index] ?? '',
        }));
      }

      return nextItems.map((item, index) => ({
        id: currentRows[index]?.id ?? makeEditorRow().id,
        value: item ?? '',
      }));
    });
  }, [value]);

  const commitRows = (nextRows) => {
    setRows(nextRows);
    onChange(nextRows.map((row) => row.value));
  };

  const updateItem = (id, nextValue) => {
    commitRows(rows.map((item) => (item.id === id ? { ...item, value: nextValue } : item)));
  };

  const addItem = () => commitRows([...rows, makeEditorRow('')]);
  const removeItem = (id) => commitRows(rows.filter((item) => item.id !== id));

  return (
    <div className="space-y-3 rounded-2xl border border-secondary/40 bg-primary/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-text">{label}</h4>
          <p className="text-xs text-text-muted">{helper}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-secondary/50 bg-secondary/10 px-4 py-6 text-sm text-text-muted">
            No items yet. Add the first entry.
          </div>
        ) : (
          rows.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-secondary/50 bg-secondary/20 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 text-red-300"
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const HeroWordsEditor = ({ label, helper, placeholder, value, onChange }) => {
  const items = Array.isArray(value) ? value : [];
  const [rows, setRows] = useState(() => items.map((item) => makeEditorRow(item)));

  useEffect(() => {
    const nextItems = Array.isArray(value) ? value : [];
    // Keep the local row IDs stable when the source array changes externally.
    // This is intentional state syncing for a controlled editor, not an effect side-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows((currentRows) => {
      if (
        currentRows.length === nextItems.length &&
        currentRows.every((row, index) => row.value === (nextItems[index] ?? ''))
      ) {
        return currentRows;
      }

      if (currentRows.length === nextItems.length) {
        return currentRows.map((row, index) => ({
          ...row,
          value: nextItems[index] ?? '',
        }));
      }

      return nextItems.map((item, index) => ({
        id: currentRows[index]?.id ?? makeEditorRow().id,
        value: item ?? '',
      }));
    });
  }, [value]);

  const commitRows = (nextRows) => {
    setRows(nextRows);
    onChange(nextRows.map((row) => row.value));
  };

  const updateItem = (id, nextValue) => {
    commitRows(rows.map((item) => (item.id === id ? { ...item, value: nextValue } : item)));
  };

  const addItem = () => commitRows([...rows, makeEditorRow('')]);
  const removeItem = (id) => commitRows(rows.filter((item) => item.id !== id));

  return (
    <div className="rounded-3xl border border-accent/20 bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.12),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.78))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">{label}</h4>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-accent">
              {items.length} items
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{helper}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-accent/90"
        >
          <Plus size={14} />
          Add phrase
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-secondary/50 bg-secondary/10 px-4 py-6 text-sm text-text-muted">
            Start with 3-5 short phrases. Keep them punchy and readable.
          </div>
        ) : (
          rows.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-secondary/15 px-3 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-full border border-red-400/20 bg-red-400/10 p-2 text-red-300 transition-colors hover:bg-red-400/20"
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const RepeatableObjectEditor = ({ label, helper, value, onChange, createItem, fields, onUpload }) => {
  const normalizeItem = useCallback(
    (item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return item;
      }

      const base = createItem();
      if (typeof item === 'string') {
        if (Object.prototype.hasOwnProperty.call(base, 'name')) {
          return { ...base, name: item };
        }
        if (Object.prototype.hasOwnProperty.call(base, 'label')) {
          return { ...base, label: item };
        }
        if (Object.prototype.hasOwnProperty.call(base, 'url')) {
          return { ...base, url: item };
        }
        return { ...base, value: item };
      }

      return base;
    },
    [createItem]
  );

  const items = Array.isArray(value) ? value : [];
  const [rows, setRows] = useState(() => items.map((item) => makeEditorRow(normalizeItem(item))));

  useEffect(() => {
    const nextItems = Array.isArray(value) ? value : [];
    // Keep the local row IDs stable when the source array changes externally.
    // This is intentional state syncing for a controlled editor, not an effect side-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows((currentRows) => {
      const normalizedNextItems = nextItems.map((item) => normalizeItem(item));

      if (
        currentRows.length === normalizedNextItems.length &&
        currentRows.every((row, index) => JSON.stringify(row.value) === JSON.stringify(normalizedNextItems[index] ?? {}))
      ) {
        return currentRows;
      }

      if (currentRows.length === normalizedNextItems.length) {
        return currentRows.map((row, index) => ({
          ...row,
          value: normalizedNextItems[index] ?? {},
        }));
      }

      return normalizedNextItems.map((item, index) => ({
        id: currentRows[index]?.id ?? makeEditorRow().id,
        value: item ?? createItem(),
      }));
    });
  }, [value, normalizeItem, createItem]);

  const commitRows = (nextRows) => {
    setRows(nextRows);
    onChange(nextRows.map((row) => row.value));
  };

  const updateItem = (id, key, nextValue) => {
    commitRows(rows.map((item) => (item.id === id ? { ...item, value: { ...item.value, [key]: nextValue } } : item)));
  };

  const addItem = () => commitRows([...rows, makeEditorRow(createItem())]);
  const removeItem = (id) => commitRows(rows.filter((item) => item.id !== id));

  return (
    <div className="space-y-3 rounded-2xl border border-secondary/40 bg-primary/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-text">{label}</h4>
          <p className="text-xs text-text-muted">{helper}</p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-secondary/50 bg-secondary/10 px-4 py-6 text-sm text-text-muted">
            No entries yet. Add the first card.
          </div>
        ) : (
          rows.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-text-muted">{label} {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-full border border-red-400/20 bg-red-400/10 p-2 text-red-300"
                  aria-label={`Remove ${label} ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="mb-2 block text-sm font-semibold text-text">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                      >
                        <option value="" disabled>
                          Select {field.label.toLowerCase()}
                        </option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                      />
                    ) : field.type === 'image' ? (
                      <div className="flex gap-2 min-w-0">
                        <input
                          type="text"
                          value={item.value?.[field.key] ?? ''}
                          onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                          placeholder="Enter image URL or upload file"
                          className="flex-1 min-w-0 rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                        />
                        {onUpload && (
                          <button
                            type="button"
                            onClick={async () => {
                              const url = await onUpload(field.key, field.accept);
                              if (url) {
                                updateItem(item.id, field.key, url);
                              }
                            }}
                            className="shrink-0 relative z-10 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-accent"
                            aria-label={`Upload ${field.label}`}
                          >
                            <ImageIcon size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.value?.[field.key] ?? ''}
                        onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                        className="w-full rounded-xl border border-secondary/50 bg-primary/50 px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SITE_CONTENT_TABS = [
  { id: 'hero', label: 'Hero', hint: 'Homepage headline & artwork' },
  { id: 'contact', label: 'Contact', hint: 'Email, availability, résumé' },
  { id: 'about', label: 'About', hint: 'Bio, lists, education, stats' },
  { id: 'footer', label: 'Footer', hint: 'Footer copy & social links' },
];

const ABOUT_SUB_TABS = [
  { id: 'bio', label: 'Bio & photo', hint: 'Long copy and portrait' },
  { id: 'lists', label: 'Lists', hint: 'Learning, tools, goals, hobbies' },
  { id: 'cards', label: 'Cards', hint: 'Education, stats, approach' },
];

const SiteEditor = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.site, initialSiteContent);
  const [draft, setDraft] = useState(() => normalizeSiteDraft(initialSiteContent));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [siteTab, setSiteTab] = useState('hero');
  const [aboutSubTab, setAboutSubTab] = useState('bio');

  useEffect(() => {
    if (data === undefined) return;
    setDraft(normalizeSiteDraft(data ?? initialSiteContent));
  }, [data]);

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const uploadAsset = async (key) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.gif,.mp4,.webm';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        const url = await uploadCmsAsset(file, `site/${key}`);
        updateField(key, url);
        setStatus('Media uploaded.');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const save = async () => {
    setBusy(true);
    try {
      const mediaErrors = [
        ['Profile Photo URL', draft.profilePhotoUrl],
        ['Hero Artwork URL', draft.heroArtworkUrl],
        ['Resume URL', draft.resumeUrl],
      ]
        .filter(([, value]) => value && !isLikelyAssetUrl(value))
        .map(([label]) => `${label} must be a valid URL or root-relative path.`);

      if (mediaErrors.length > 0) {
        setStatus(`Please fix media before publishing: ${mediaErrors.join(' ')}`);
        return;
      }

      await saveCmsDoc(CMS_DOCS.site, {
        heroTitle: draft.heroTitle,
        heroSubtitle: draft.heroSubtitle,
        heroIntro: draft.heroIntro,
        heroWordsJson: draft.heroWordsJson,
        currentLearningJson: draft.currentLearningJson,
        devEnvironmentJson: draft.devEnvironmentJson,
        careerGoalsJson: draft.careerGoalsJson,
        hobbiesJson: draft.hobbiesJson,
        educationJson: draft.educationJson,
        availability: draft.availability,
        contactEmail: draft.contactEmail,
        preferredContact: draft.preferredContact,
        responseSla: draft.responseSla,
        bookingUrl: draft.bookingUrl,
        cvVersion: draft.cvVersion,
        cvUpdatedAt: draft.cvUpdatedAt,
        resumeUrl: draft.resumeUrl,
        githubUsername: draft.githubUsername,
        profilePhotoUrl: draft.profilePhotoUrl,
        heroArtworkUrl: draft.heroArtworkUrl,
        aboutParagraphs: draft.aboutParagraphs,
        aboutStatsJson: draft.aboutStatsJson,
        engineeringApproachJson: draft.engineeringApproachJson,
        footerTagline: draft.footerTagline,
        footerEmail: draft.footerEmail,
        socialLinksJson: draft.socialLinksJson,
      });
      setStatus('Site content saved.');
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-secondary/25 p-10 text-center text-text-muted">
        Loading site settings…
      </div>
    );
  }

  const labelFromKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-secondary/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <div className="space-y-6 p-6 sm:p-8 sm:pb-28">
        <SectionBanner
          icon={Settings2}
          title="Website Content"
          help="Switch tabs to focus on one area at a time. Saving writes all sections to Firestore."
          onSave={save}
          onReset={() => setDraft(normalizeSiteDraft(initialSiteContent))}
          hidePrimarySave
        />

        <AdminStatus message={status} />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-text-muted">Section</p>
          <div className="flex flex-wrap gap-2">
            {SITE_CONTENT_TABS.map((tab) => {
              const active = siteTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSiteTab(tab.id)}
                  className={clsx(
                    'rounded-xl border px-3.5 py-2 text-left text-sm transition-colors',
                    active
                      ? 'border-accent/40 bg-accent/15 font-semibold text-accent shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.12)]'
                      : 'border-white/10 bg-primary/30 text-text-muted hover:border-accent/25 hover:text-text'
                  )}
                >
                  <span className="block">{tab.label}</span>
                  <span className="mt-0.5 block text-[11px] font-normal text-text-muted">{tab.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {siteTab === 'hero' && (
          <SiteSection
            title="Hero & intro"
            description="Headline, intro paragraph, rotating phrases, and hero artwork shown on the homepage."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {['heroTitle', 'heroSubtitle'].map((key) => (
                <FieldEditor
                  key={key}
                  field={{ key, label: labelFromKey(key), type: 'text' }}
                  value={draft[key]}
                  onChange={(value) => updateField(key, value)}
                />
              ))}
            </div>
            <FieldEditor
              field={{ key: 'heroIntro', label: 'Hero Intro', type: 'textarea' }}
              value={draft.heroIntro}
              onChange={(value) => updateField('heroIntro', value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FieldEditor
                field={{ key: 'heroArtworkUrl', label: 'Hero Artwork URL', type: 'image' }}
                value={draft.heroArtworkUrl}
                onChange={(value) => updateField('heroArtworkUrl', value)}
                onUpload={() => uploadAsset('heroArtworkUrl')}
              />
            </div>
            {Object.entries(stringListConfig)
              .filter(([k]) => k === 'heroWordsJson')
              .map(([key, config]) => (
                <HeroWordsEditor
                  key={key}
                  label={config.label}
                  helper={config.helper}
                  placeholder={config.placeholder}
                  value={draft[key]}
                  onChange={(value) => updateField(key, value)}
                />
              ))}
          </SiteSection>
        )}

        {siteTab === 'contact' && (
          <SiteSection
            title="Contact & availability"
            description="How visitors reach you, response expectations, and résumé / CV links."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {['availability', 'contactEmail', 'preferredContact', 'responseSla', 'bookingUrl', 'cvVersion', 'cvUpdatedAt', 'githubUsername'].map(
                (key) => (
                  <FieldEditor
                    key={key}
                    field={{ key, label: labelFromKey(key), type: 'text' }}
                    value={draft[key]}
                    onChange={(value) => updateField(key, value)}
                  />
                )
              )}
            </div>
            <FieldEditor
              field={{ key: 'resumeUrl', label: 'Resume PDF URL', type: 'file' }}
              value={draft.resumeUrl}
              onChange={(value) => updateField('resumeUrl', value)}
              onUpload={() => uploadAsset('resumeUrl', 'application/pdf')}
            />
          </SiteSection>
        )}

        {siteTab === 'about' && (
          <SiteSection
            title="About & profile"
            description="Use the subtabs to switch between bio, line-item lists, and structured cards—less scrolling, same data."
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-text-muted">About section</p>
              <div className="flex flex-wrap gap-2">
                {ABOUT_SUB_TABS.map((tab) => {
                  const active = aboutSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAboutSubTab(tab.id)}
                      className={clsx(
                        'rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                        active
                          ? 'border-accent/40 bg-accent/15 font-semibold text-accent shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.12)]'
                          : 'border-white/10 bg-primary/30 text-text-muted hover:border-accent/25 hover:text-text'
                      )}
                    >
                      <span className="block">{tab.label}</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-text-muted">{tab.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {aboutSubTab === 'bio' && (
              <div className="space-y-4 pt-2">
                <FieldEditor
                  field={{ key: 'aboutParagraphs', label: 'About Paragraphs', type: 'textarea' }}
                  value={draft.aboutParagraphs}
                  onChange={(value) => updateField('aboutParagraphs', value)}
                />
                <FieldEditor
                  field={{ key: 'profilePhotoUrl', label: 'Profile Photo URL', type: 'image' }}
                  value={draft.profilePhotoUrl}
                  onChange={(value) => updateField('profilePhotoUrl', value)}
                  onUpload={() => uploadAsset('profilePhotoUrl')}
                />
              </div>
            )}

            {aboutSubTab === 'lists' && (
              <div className="grid gap-4 pt-2">
                {Object.entries(stringListConfig)
                  .filter(([k]) => k !== 'heroWordsJson')
                  .map(([key, config]) => (
                    <RepeatableTextEditor
                      key={key}
                      label={config.label}
                      helper={config.helper}
                      placeholder={config.placeholder}
                      value={draft[key]}
                      onChange={(value) => updateField(key, value)}
                    />
                  ))}
              </div>
            )}

            {aboutSubTab === 'cards' && (
              <div className="grid gap-4 pt-2">
                {Object.entries(objectEditorConfigs)
                  .filter(([key]) => key !== 'socialLinksJson')
                  .map(([key, config]) => (
                    <RepeatableObjectEditor
                      key={key}
                      label={config.label}
                      helper={config.helper}
                      value={draft[key]}
                      onChange={(value) => updateField(key, value)}
                      createItem={config.createItem}
                      fields={config.fields}
                    />
                  ))}
              </div>
            )}
          </SiteSection>
        )}

        {siteTab === 'footer' && (
          <SiteSection title="Footer & social" description="Footer copy and outbound social links.">
            <div className="grid gap-4 md:grid-cols-2">
              {['footerTagline', 'footerEmail'].map((key) => (
                <FieldEditor
                  key={key}
                  field={{ key, label: labelFromKey(key), type: 'text' }}
                  value={draft[key]}
                  onChange={(value) => updateField(key, value)}
                />
              ))}
            </div>
            {objectEditorConfigs.socialLinksJson && (
              <RepeatableObjectEditor
                label={objectEditorConfigs.socialLinksJson.label}
                helper={objectEditorConfigs.socialLinksJson.helper}
                value={draft.socialLinksJson}
                onChange={(value) => updateField('socialLinksJson', value)}
                createItem={objectEditorConfigs.socialLinksJson.createItem}
                fields={objectEditorConfigs.socialLinksJson.fields}
              />
            )}
          </SiteSection>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-white/10 bg-primary/85 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">Saving updates the live site content document in Firestore.</p>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary shadow-[0_4px_24px_rgb(var(--color-accent-rgb)/0.25)] transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
          >
            <Save size={16} />
            {busy ? 'Saving…' : 'Save site content'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { user, loading } = useAuthState();
  const [activeTab, setActiveTab] = useState('site');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const tabGroups = [
    {
      label: 'Overview',
      items: [{ id: 'site', label: 'Website Content', icon: Settings2 }],
    },
    {
      label: 'Collections',
      items: [
        { id: CMS_DOCS.projects, label: 'Projects', icon: Folder },
        { id: CMS_DOCS.certifications, label: 'Certificates', icon: Award },
        { id: CMS_DOCS.skills, label: 'Skills', icon: Wrench },
        { id: CMS_DOCS.experience, label: 'Experience', icon: Sparkles },
        { id: CMS_DOCS.blog, label: 'Blog', icon: BookOpen },
        { id: CMS_DOCS.testimonials, label: 'Testimonials', icon: Quote },
        { id: CMS_DOCS.services, label: 'Services', icon: Briefcase },
        { id: CMS_DOCS.openSource, label: 'Open Source', icon: Github },
        { id: CMS_DOCS.resources, label: 'Resources', icon: LinkIcon },
      ],
    },
  ];
  const tabs = tabGroups.flatMap((g) => g.items);

  const login = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgb(var(--color-accent-rgb)/0.08),transparent)] px-4 py-20 text-text">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-secondary/30 p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mx-auto mb-5 inline-flex rounded-2xl border border-accent/25 bg-accent/10 p-4 text-accent shadow-[0_0_32px_rgb(var(--color-accent-rgb)/0.15)]">
            <Shield size={36} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-text-muted">Checking your admin session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgb(var(--color-accent-rgb)/0.1),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgb(var(--color-accent-rgb)/0.05),transparent)] px-4 py-10 text-text sm:py-14">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_1.02fr] lg:items-stretch">
          <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-secondary/30 p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:p-10">
            <div className="mb-8">
              <div className="mb-5 inline-flex rounded-2xl border border-accent/25 bg-accent/10 p-3.5 text-accent">
                <LayoutDashboard size={26} strokeWidth={1.75} />
              </div>
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-accent">Portfolio CMS</p>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">Sign in</h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
                Edit site copy, projects, and media-backed content. Use your Firebase admin account below.
              </p>
            </div>

            <form onSubmit={login} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-primary/50 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-primary/50 px-4 py-3 pr-12 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-text-muted transition-colors hover:text-accent"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="rounded-xl border border-red-400/35 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={authBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-primary shadow-[0_8px_32px_rgb(var(--color-accent-rgb)/0.28)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                <LogIn size={18} />
                {authBusy ? 'Signing in…' : 'Sign in to dashboard'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-xs leading-relaxed text-text-muted">
              <div className="mb-2 flex items-center gap-2 font-medium text-amber-200/95">
                <AlertTriangle size={15} className="shrink-0" />
                Before first login
              </div>
              Enable Email/Password in Firebase Authentication and add your email to the <code className="rounded bg-primary/50 px-1.5 py-0.5 font-mono text-[0.7rem] text-accent">admins</code>{' '}
              collection expected by Firestore rules.
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.14),transparent_40%),linear-gradient(145deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-accent">What you can manage</p>
              <h2 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-text sm:text-[2rem]">
                Content that stays in sync with your live site.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
                Firestore documents power the public pages; Storage holds uploads. Change copy or add a project here and publish with Save.
              </p>
            </div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                'Site copy & hero',
                'Projects & case studies',
                'Skills, blog & testimonials',
                'Certificates & resources',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-text"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                    <CheckCircle2 size={14} className="text-accent" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const activeSection = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-primary bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgb(var(--color-accent-rgb)/0.07),transparent)] px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-secondary/30 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="hidden rounded-2xl border border-accent/25 bg-accent/10 p-3 text-accent sm:block">
              <Shield size={22} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Admin</p>
              <h1 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Content dashboard
              </h1>
              <p className="mt-2 truncate text-sm text-text-muted">
                Signed in as <span className="font-medium text-text">{user.email}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-primary/40 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/35 hover:bg-primary/55"
            >
              <ArrowLeft size={16} />
              View site
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-200 transition-colors hover:bg-red-400/15"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <nav
              className="max-h-[min(70vh,calc(100vh-8rem))] overflow-y-auto rounded-3xl border border-white/10 bg-secondary/30 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md [scrollbar-width:thin] lg:max-h-[calc(100vh-5rem)]"
              aria-label="Admin sections"
            >
              {tabGroups.map((group) => (
                <div key={group.label} className="mb-5 last:mb-0">
                  <p className="mb-2 px-3 text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted/90">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={clsx(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                            isActive
                              ? 'border border-accent/35 bg-accent/15 font-semibold text-accent shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.12)]'
                              : 'border border-transparent text-text-muted hover:border-white/10 hover:bg-primary/40 hover:text-text'
                          )}
                        >
                          <Icon size={17} strokeWidth={1.75} className={isActive ? 'text-accent' : 'opacity-80'} />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 space-y-6">
            {activeSection.id === 'site' && <SiteEditor />}
            {activeSection.id === CMS_DOCS.projects && (
              <CollectionEditor
                docId={CMS_DOCS.projects}
                section={sectionConfig[CMS_DOCS.projects]}
                fields={projectFields}
              />
            )}
            {activeSection.id === CMS_DOCS.certifications && (
              <CollectionEditor
                docId={CMS_DOCS.certifications}
                section={sectionConfig[CMS_DOCS.certifications]}
                fields={certificateFields}
              />
            )}
            {activeSection.id === CMS_DOCS.skills && (
              <CollectionEditor
                docId={CMS_DOCS.skills}
                section={sectionConfig[CMS_DOCS.skills]}
                fields={skillFields}
              />
            )}
            {activeSection.id === CMS_DOCS.experience && (
              <CollectionEditor
                docId={CMS_DOCS.experience}
                section={sectionConfig[CMS_DOCS.experience]}
                fields={experienceFields}
              />
            )}
            {activeSection.id === CMS_DOCS.blog && (
              <CollectionEditor docId={CMS_DOCS.blog} section={sectionConfig[CMS_DOCS.blog]} fields={blogFields} />
            )}
            {activeSection.id === CMS_DOCS.testimonials && (
              <CollectionEditor
                docId={CMS_DOCS.testimonials}
                section={sectionConfig[CMS_DOCS.testimonials]}
                fields={testimonialFields}
              />
            )}
            {activeSection.id === CMS_DOCS.services && (
              <CollectionEditor
                docId={CMS_DOCS.services}
                section={sectionConfig[CMS_DOCS.services]}
                fields={serviceFields}
              />
            )}
            {activeSection.id === CMS_DOCS.openSource && (
              <CollectionEditor
                docId={CMS_DOCS.openSource}
                section={sectionConfig[CMS_DOCS.openSource]}
                fields={openSourceFields}
              />
            )}
            {activeSection.id === CMS_DOCS.resources && (
              <CollectionEditor
                docId={CMS_DOCS.resources}
                section={sectionConfig[CMS_DOCS.resources]}
                fields={resourceFields}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
