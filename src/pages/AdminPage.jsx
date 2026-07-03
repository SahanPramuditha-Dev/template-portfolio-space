/* eslint-disable react-refresh/only-export-components */
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
  LineChart,
  BarChart2,
  RefreshCw,
  Mail,
  GripVertical,
  Menu,
  X,
  UploadCloud,
  ExternalLink,
  Terminal,
  Globe,
  Filter,
  Laptop,
  Activity,
  Clock,
  Trash,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import {
  CMS_DOCS,
  loginWithEmail,
  logout,
  saveCmsDoc,
  uploadCmsAsset,
  useAuthState,
  useCmsDoc,
} from '../lib/cms';
import MessagesInbox from '../components/MessagesInbox';
import MediaLibrary from '../components/MediaLibrary';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Link } from 'react-router-dom';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageCropperModal from '../components/ImageCropperModal';

let resolveCropPromise = null;
let rejectCropPromise = null;
export const requestImageCrop = (file, aspect = null) => {
  return new Promise((resolve, reject) => {
    resolveCropPromise = resolve;
    rejectCropPromise = reject;
    const event = new CustomEvent('show-crop-modal', { detail: { file, aspect } });
    window.dispatchEvent(event);
  });
};

const CropModalRoot = () => {
  const [cropFile, setCropFile] = useState(null);
  const [cropAspect, setCropAspect] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setCropFile(e.detail.file);
      setCropAspect(e.detail.aspect);
    };
    window.addEventListener('show-crop-modal', handler);
    return () => window.removeEventListener('show-crop-modal', handler);
  }, []);

  if (!cropFile) return null;

  return (
    <ImageCropperModal
      imageFile={cropFile}
      aspect={cropAspect}
      onCropComplete={(blob) => {
        setCropFile(null);
        if (resolveCropPromise) resolveCropPromise(blob);
      }}
      onCancel={() => {
        setCropFile(null);
        if (rejectCropPromise) rejectCropPromise(new Error('Cancelled'));
      }}
    />
  );
};

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
  baseLocation: 'Colombo, Sri Lanka',
  currentFocus: 'Building and scaling personal projects.',
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
  seoTitle: 'Sahan Pramuditha | Software Engineer and Creative Developer',
  seoDescription: 'Sahan Pramuditha is a software engineer and creative developer building accessible, high-performance digital experiences.',
  seoImage: '',
  seoFavicon: '',
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
  architectureImage: '',
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
  documents: [],
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
  completed: false,
  projectType: 'personal',
  isPrivate: false,
  demoEmail: '',
  demoPassword: '',
  perfScore: '',
  accessScore: '',
  bestScore: '',
  seoScore: '',
};

const initialCertificate = {
  title: '',
  issuer: '',
  date: '',
  credential: '',
  link: '',
  skills: '',
  image: '',
  pdfUrl: '',
  category: 'Other',
  featured: false,
};

const initialSkillGroup = {
  title: '',
  order: 0,
  skillsJson: [],
};

const initialResource = {
  title: '',
  type: 'Link',
  category: '',
  author: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  url: '',
  fileUrl: '',
  thumbnail: '',
  featured: false,
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
  { key: 'missionCode', label: 'Mission Code', type: 'text', group: 'summary', placeholder: 'e.g. STUDYOS' },
  { key: 'year', label: 'Year', type: 'number', group: 'summary', placeholder: 'e.g. 2026' },
  { key: 'title', label: 'Title', type: 'text', group: 'summary', placeholder: 'e.g. StudyOS' },
  { key: 'shortDescription', label: 'Short Description (5-second intro)', type: 'textarea', group: 'summary', placeholder: 'e.g. AI-powered study operating system that helps students organize notes, generate flashcards, and automate learning.' },
  { key: 'tech', label: 'Tech Stack Tags', type: 'list', placeholder: 'Enter a tech (e.g. Next.js, React, Supabase)', group: 'summary' },
  { key: 'category', label: 'Category', type: 'text', group: 'summary', placeholder: 'e.g. Web Apps / Productivity' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['Draft', 'In progress', 'Live', 'Archived'],
    group: 'summary',
  },
  { key: 'client', label: 'Client / Company', type: 'text', group: 'summary', placeholder: 'e.g. StudyOS Inc. / Personal Research' },
  { key: 'industry', label: 'Industry', type: 'text', group: 'summary', placeholder: 'e.g. EdTech / SaaS / productivity' },
  { key: 'teamSize', label: 'Team Size', type: 'text', group: 'summary', placeholder: 'e.g. Sole Developer / 3 engineers' },
  { key: 'projectTimeline', label: 'Timeline / Duration', type: 'text', group: 'summary', placeholder: 'e.g. 3 Months (Spring 2026)' },
  { key: 'outcomeBadge', label: 'Outcome Badge (Metrics Callout)', type: 'text', group: 'summary', placeholder: 'e.g. Reduced loading lag by 40%' },
  { key: 'featured', label: 'Featured Project', type: 'checkbox', group: 'summary' },
  { key: 'completed', label: 'Completed Project Status', type: 'checkbox', group: 'summary' },
  {
    key: 'projectType',
    label: 'Project Context Type',
    type: 'select',
    options: ['personal', 'client'],
    group: 'summary',
  },
  { key: 'isPrivate', label: 'Private Code / Private Repository', type: 'checkbox', group: 'summary' },
  { key: 'description', label: 'Case Study Description (Overview)', type: 'markdown', group: 'story', placeholder: 'Provide a detailed summary description of this case study.' },
  { key: 'role', label: 'Your Specific Role', type: 'text', group: 'story', placeholder: 'e.g. Lead Full-Stack Architect & UI Designer' },
  { key: 'problem', label: 'Problem Statement', type: 'textarea', group: 'story', placeholder: 'e.g. Students use multiple disconnected platforms for notes, calendars, and tasks, causing cognitive load.' },
  { key: 'solution', label: 'Proposed Solution', type: 'textarea', group: 'story', placeholder: 'e.g. StudyOS centralizes study tasks, document summaries, and flashcards into one unified AI workspace.' },
  { key: 'architecture', label: 'Architecture (ASCII Text Fallback)', type: 'markdown', group: 'story', placeholder: 'Use this text area only if you do not upload an Architecture Image diagram.' },
  { key: 'features', label: 'Key Features List', type: 'list', placeholder: 'e.g. Automatic flashcard generation / Spaced repetition algorithm', group: 'story' },
  { key: 'learned', label: 'What I Learned (Lessons Learned Reflection)', type: 'textarea', group: 'story', placeholder: 'Explain key technical growth, prompt engineering, and architecture takeaways.' },
  { key: 'lessonsLearned', label: 'Alternative Lessons learned', type: 'textarea', group: 'story', placeholder: 'Reflection notes.' },
  { key: 'nextSteps', label: 'Next Steps & Future Roadmaps', type: 'textarea', group: 'story', placeholder: 'e.g. Integrating offline vector syncing and real-time collaboration.' },
  { key: 'challenges', label: 'Engineering Challenges', type: 'textarea', group: 'story', placeholder: 'e.g. Optimizing OpenAI token costs for large document processing.' },
  { key: 'outcomes', label: 'Business & User Outcomes', type: 'textarea', group: 'story', placeholder: 'e.g. Increased student study consistency metrics by 25%.' },
  {
    key: 'impactMetricsJson',
    label: 'Impact Metrics Data Grid',
    type: 'object-list',
    group: 'metrics',
    createItem: () => ({ label: '', value: '', suffix: '' }),
    fields: [
      { key: 'label', label: 'Label (e.g. Screens designed)', type: 'text', placeholder: 'e.g. AI Features Built' },
      { key: 'value', label: 'Value (e.g. 45)', type: 'text', placeholder: 'e.g. 12' },
      { key: 'suffix', label: 'Suffix (e.g. +)', type: 'text', placeholder: 'e.g. +' },
    ],
  },
  { key: 'github', label: 'GitHub Repo URL', type: 'text', group: 'links', placeholder: 'https://github.com/...' },
  { key: 'external', label: 'Live Demo URL', type: 'text', group: 'links', placeholder: 'https://studyos.com' },
  { key: 'demoEmail', label: 'Demo Email Credentials', type: 'text', group: 'links', placeholder: 'e.g. demo@studyos.com' },
  { key: 'demoPassword', label: 'Demo Password Credentials', type: 'text', group: 'links', placeholder: 'e.g. studyos123' },
  { key: 'perfScore', label: 'Lighthouse Performance Score (0-100)', type: 'text', group: 'metrics', placeholder: 'e.g. 98' },
  { key: 'accessScore', label: 'Lighthouse Accessibility Score (0-100)', type: 'text', group: 'metrics', placeholder: 'e.g. 100' },
  { key: 'bestScore', label: 'Lighthouse Best Practices Score (0-100)', type: 'text', group: 'metrics', placeholder: 'e.g. 100' },
  { key: 'seoScore', label: 'Lighthouse SEO Score (0-100)', type: 'text', group: 'metrics', placeholder: 'e.g. 100' },
  { key: 'sandboxUrl', label: 'Live Code Sandbox URL', type: 'text', group: 'links', placeholder: 'e.g. StackBlitz embed link' },
  { key: 'videoUrl', label: 'Video Preview URL (mp4/webm file link)', type: 'text', group: 'media', placeholder: 'https://...' },
  { key: 'videoCaption', label: 'Video Caption', type: 'text', group: 'media', placeholder: 'e.g. StudyOS core application interface walkthrough' },
  { key: 'thumbnail', label: 'Thumbnail Image File', type: 'image', group: 'media' },
  { key: 'architectureImage', label: 'Architecture Diagram Image File', type: 'image', group: 'media' },
  {
    key: 'documents',
    label: 'Documents & Presentations',
    type: 'object-list',
    group: 'media',
    helper: 'Upload PDFs, slide decks, or text documents (click upload icon).',
    createItem: () => ({ url: '', name: '' }),
    fields: [
      { key: 'url', label: 'File URL', type: 'file' },
      { key: 'name', label: 'Document Name', type: 'text', placeholder: 'e.g. Pitch Deck' },
    ],
  },
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
  { key: 'category', label: 'Category', type: 'select', group: 'identity',
    options: ['Cloud', 'Data', 'Programming', 'Networking', 'Microsoft', 'AWS', 'Security', 'DevOps', 'AI/ML', 'Other'] },
  { key: 'featured', label: 'Featured (show on portfolio homepage)', type: 'checkbox', group: 'identity' },
  { key: 'skills', label: 'Skills', type: 'list', placeholder: 'Enter a skill', group: 'identity' },
  { key: 'durationHours', label: 'Course Duration (Hours)', type: 'number', group: 'identity' },
  { key: 'image', label: 'Badge / Logo Image', type: 'image', group: 'media', aspect: null },
  { key: 'pdfUrl', label: 'Certificate PDF', type: 'pdf', group: 'media', accept: 'application/pdf,.pdf' },
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
  { key: 'type', label: 'Resource Type', type: 'select', group: 'resourceMeta',
    options: ['Link', 'PDF', 'Document', 'Image', 'Video', 'Tool', 'Cheat Sheet', 'Template', 'Other'] },
  { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Design, DevOps, AI…', group: 'resourceMeta' },
  { key: 'author', label: 'Author / Source', type: 'text', placeholder: 'e.g. Google, MDN, your name…', group: 'resourceMeta' },
  { key: 'date', label: 'Date Added', type: 'text', placeholder: 'YYYY-MM-DD', group: 'resourceMeta' },
  { key: 'featured', label: 'Featured (pin to top)', type: 'checkbox', group: 'resourceMeta' },
  { key: 'description', label: 'Description', type: 'textarea', group: 'resourceContent' },
  { key: 'url', label: 'External URL (for links / references)', type: 'text', placeholder: 'https://…', group: 'resourceContent' },
  { key: 'fileUrl', label: 'Upload File (PDF, Doc, Image, Video)', type: 'file', group: 'resourceMedia',
    accept: 'application/pdf,.pdf,.doc,.docx,image/*,video/*' },
  { key: 'thumbnail', label: 'Thumbnail / Preview Image', type: 'image', group: 'resourceMedia', aspect: null },
];

const blogFields = [
  { key: 'slug', label: 'Slug', type: 'text', group: 'meta' },
  { key: 'title', label: 'Title', type: 'text', group: 'meta' },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea', group: 'meta' },
  { key: 'tags', label: 'Tags', type: 'list', placeholder: 'Enter a tag', group: 'meta' },
  { key: 'category', label: 'Category', type: 'text', group: 'meta' },
  { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Published'], group: 'meta' },
  { key: 'date', label: 'Publish Date', type: 'text', group: 'meta' },
  { key: 'readTime', label: 'Read Time', type: 'text', group: 'meta' },
  { key: 'featured', label: 'Featured Post', type: 'checkbox', group: 'meta' },
  { key: 'body', label: 'Body', type: 'markdown', group: 'content' },
  { key: 'codeSnippet', label: 'Code Snippet', type: 'markdown', group: 'content' },
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
  // ── Offer headline
  { key: 'title',    label: 'Title',    type: 'text',   group: 'serviceOffer' },
  { key: 'status',   label: 'Status',   type: 'select', options: ['Draft', 'Published'], group: 'serviceOffer' },
  { key: 'category', label: 'Category', type: 'select',
    options: ['Web Development', 'Mobile Development', 'UI/UX Design', 'API & Backend', 'Consulting', 'Data & Analytics', 'DevOps', 'Other'],
    group: 'serviceOffer' },
  { key: 'icon',     label: 'Icon name (Lucide)', type: 'text', placeholder: 'e.g. Globe, Code2, Layers, Cpu, BarChart2…', group: 'serviceOffer' },
  { key: 'summary',  label: 'Summary (card pitch)',  type: 'textarea', group: 'serviceOffer' },
  { key: 'featured', label: 'Featured (show on homepage)', type: 'checkbox', group: 'serviceOffer' },
  { key: 'availability', label: 'Availability', type: 'select',
    options: ['Available now', 'Limited availability', 'Booking soon', 'Waitlist only', 'Unavailable'],
    group: 'serviceOffer' },
  { key: 'idealFor', label: 'Ideal for (target clients)', type: 'text',
    placeholder: 'e.g. Startups, E-commerce, SMEs, Agencies', group: 'serviceOffer' },
  // ── Pricing & timing (LKR)
  { key: 'startingPrice', label: 'Starting Price (LKR)', type: 'text',
    placeholder: 'e.g. From Rs. 15,000 / Rs. 8,000–25,000', group: 'serviceDelivery' },
  { key: 'timeline',   label: 'Typical Timeline', type: 'text', placeholder: 'e.g. 2–4 weeks',         group: 'serviceDelivery' },
  { key: 'turnaround', label: 'Turnaround',        type: 'text', placeholder: 'e.g. 48 hr first draft', group: 'serviceDelivery' },
  // ── Scope & deliverables
  { key: 'scope',        label: 'Scope description', type: 'textarea', group: 'serviceDelivery' },
  { key: 'deliverables', label: 'Deliverables',       type: 'textarea', group: 'serviceDelivery' },
  { key: 'features',     label: "What's included (checklist)", type: 'list',
    placeholder: 'e.g. Responsive design, Source code delivery, 2 revisions…', group: 'serviceDelivery' },
  // ── Process steps
  {
    key: 'processSteps',
    label: 'Process Steps (how you work)',
    type: 'object-list',
    group: 'serviceProcess',
    createItem: () => ({ step: '', description: '' }),
    fields: [
      { key: 'step',        label: 'Step name',        type: 'text', placeholder: 'e.g. Discovery' },
      { key: 'description', label: 'Short description', type: 'text', placeholder: 'e.g. We discuss goals and scope' },
    ],
  },
  // ── Service Templates (optional)
  {
    key: 'templates',
    label: 'Service Templates (optional)',
    type: 'object-list',
    group: 'serviceProcess',
    createItem: () => ({ name: '', description: '', demoUrl: '', imageUrl: '', vibe: '' }),
    fields: [
      { key: 'name',        label: 'Template Name',     type: 'text', placeholder: 'e.g. Minimal & Clean' },
      { key: 'vibe',        label: 'Style / Vibe',      type: 'text', placeholder: 'e.g. Clean typography, light mode' },
      { key: 'description', label: 'Brief description', type: 'text', placeholder: 'e.g. Best for writers and minimal engineers' },
      { key: 'demoUrl',     label: 'Live Demo URL',     type: 'text', placeholder: 'https://demo-minimal.me' },
      { key: 'imageUrl',    label: 'Preview Image URL', type: 'image' },
    ],
  },
  // ── CTA & links
  { key: 'cta',            label: 'CTA button label',        type: 'text', placeholder: "e.g. Let's build this, Get a quote", group: 'serviceDelivery' },
  { key: 'link',           label: 'CTA link / Booking URL',  type: 'text', placeholder: 'https://cal.com/… or /#contact',      group: 'serviceDelivery' },
  { key: 'relatedProject', label: 'Related project title',   type: 'text', placeholder: 'e.g. StudyOS — links to /projects',    group: 'serviceDelivery' },
  // ── Tags
  { key: 'tags', label: 'Tech stack tags', type: 'list', placeholder: 'e.g. React, Firebase, TypeScript', group: 'serviceDelivery' },
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
  serviceOffer:    { label: 'Offer headline',     hint: 'Title, category, icon, pitch, and availability.' },
  serviceDelivery: { label: 'Scope & delivery',   hint: 'Pricing (LKR), timeline, features, CTA, and tech tags.' },
  serviceProcess:  { label: 'Process steps',      hint: 'Numbered workflow shown on the service card.' },
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
    const needsNestedUpload = field.fields?.some((f) => f.type === 'image' || f.type === 'file');
    const uploadForObjectList =
      needsNestedUpload && section && docId
        ? async (_nestedKey, accept = 'image/*,.gif,.mp4,.webm,.pdf,.doc,.docx,.ppt,.pptx') =>
            new Promise((resolve) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = accept;
              input.onchange = async () => {
                let file = input.files?.[0];
                if (!file) {
                  resolve(null);
                  return;
                }
                if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                  try {
                    file = await requestImageCrop(file, null); // Free aspect ratio for general objects
                  } catch {
                    resolve(null);
                    return;
                  }
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
          <option value="" disabled className="bg-secondary text-text">
            Select {field.label.toLowerCase()}
          </option>
          {(field.options || []).map((option) => (
            <option key={option} value={option} className="bg-secondary text-text">
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'markdown' ? (
        <div className="prose-editor-wrapper bg-primary/40 rounded-xl overflow-hidden border border-white/10 [&_.editor-toolbar]:border-none [&_.editor-toolbar]:bg-secondary/50 [&_.editor-toolbar>button]:text-text [&_.editor-toolbar>button.active]:bg-accent/20 [&_.CodeMirror]:border-none [&_.CodeMirror]:bg-transparent [&_.CodeMirror]:text-text">
          <SimpleMdeReact
            id={fieldId}
            value={value || ''}
            onChange={(val) => onChange(val)}
            options={{
              spellChecker: false,
              status: false,
              minHeight: '200px',
            }}
          />
        </div>
      ) : field.type === 'textarea' || field.type === 'json' ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.type === 'json' ? 8 : 4}
          className={`${commonClass} font-mono text-sm`}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              id={fieldId}
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={commonClass}
            />
            {(field.type === 'image' || field.type === 'file' || field.type === 'pdf') && onUpload && (
              <button
                type="button"
                onClick={onUpload}
                className="shrink-0 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-accent"
                aria-label={`Upload ${field.label}`}
              >
                {field.type === 'pdf' ? <FileText size={16} /> : field.type === 'file' ? <FileText size={16} /> : <ImageIcon size={16} />}
              </button>
            )}
          </div>
          {field.type === 'image' && value && (
            <div className="mt-1 w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-black/20">
              <img src={value} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
            </div>
          )}
          {field.type === 'pdf' && value && (
            <div className="mt-2 w-full rounded-xl overflow-hidden border border-accent/20 bg-black/30">
              <div className="flex items-center justify-between px-4 py-2 bg-accent/10 border-b border-accent/15">
                <span className="text-xs font-mono text-accent uppercase tracking-widest">PDF Preview</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Open in new tab
                </a>
              </div>
              <iframe
                src={value}
                title="Certificate PDF Preview"
                className="w-full"
                style={{ height: '480px', border: 'none' }}
              />
            </div>
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
  const imageUrl = draft.thumbnail || (Array.isArray(draft.screenshots) && draft.screenshots[0]?.url) || draft.architectureImage || '';
  const hasImageFieldInSchema = fields.some((field) => field.type === 'image' || field.key === 'screenshots') || imageUrl;
  const pdfFieldWithValue = fields.find((field) => field.type === 'pdf' && draft[field.key]);
  const pdfUrl = pdfFieldWithValue ? draft[pdfFieldWithValue.key] : '';

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
        {hasImageFieldInSchema ? (
          imageUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/5 bg-black/40">
              <img src={imageUrl} alt="" className="h-full w-full object-cover object-top" />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center bg-secondary/30 text-xs font-mono uppercase tracking-[0.14em] text-text-muted">
              No media selected
            </div>
          )
        ) : null}
        {pdfUrl && (
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border-t border-accent/15">
            <FileText size={14} className="text-accent shrink-0" />
            <span className="text-xs font-mono text-accent truncate">PDF attached</span>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-accent hover:underline">
              Preview
            </a>
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

const SortableCollectionItem = ({ id, index, item, selectedIndex, editItem, removeItem, sectionTitle, isSelected, toggleSelection }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className="relative group">
      <div
        className={clsx(
          'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
          selectedIndex === index
            ? 'border-accent/50 bg-accent/10 shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.2)]'
            : 'border-white/10 bg-primary/30 hover:border-accent/25 hover:bg-primary/45'
        )}
      >
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-1 -ml-2 text-text-muted hover:text-text touch-none"
        >
          <GripVertical size={16} />
        </div>
        
        {toggleSelection && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); toggleSelection(index); }}
            className="h-4 w-4 rounded border-white/10 bg-primary/50 text-accent focus:ring-accent accent-accent shrink-0 mr-1"
          />
        )}

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
          className="flex-1 min-w-0 cursor-pointer outline-none"
        >
          <p className="truncate font-semibold text-text">
            {item.title || item.name || item.url || `Item ${index + 1}`}
          </p>
          <p className="truncate text-xs text-text-muted">
            {item.category || item.issuer || item.type || item.organization || sectionTitle}
          </p>
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeItem(index);
          }}
          className="shrink-0 rounded-xl border border-red-400/25 p-2 text-red-300 transition-colors hover:bg-red-400/15 relative z-10"
          aria-label={`Delete ${item.title || `item ${index + 1}`}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIndices, setSelectedIndices] = useState(new Set());

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

  const uploadAsset = async (key, accept) => {
    const resolvedAccept = accept || (key === 'pdfUrl' ? 'application/pdf,.pdf' : 'image/*,.gif,.mp4,.webm');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = resolvedAccept;
    input.onchange = async () => {
      let file = input.files?.[0];
      if (!file) return;
      if (file.type.startsWith('image/') && file.type !== 'image/gif') {
        try {
          const field = fields.find((f) => f.key === key);
          const aspect = 'aspect' in (field || {}) ? field.aspect : (key === 'thumbnail' || key === 'image' ? 16/9 : null);
          file = await requestImageCrop(file, aspect);
        } catch {
          return;
        }
      }
      setBusy(true);
      try {
        const url = await uploadCmsAsset(file, `${section.uploadFolder || 'uploads'}/${docId}`);
        updateField(key, url);
        setStatus(file.type === 'application/pdf' ? 'PDF uploaded.' : 'Media uploaded.');
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
      .filter((field) => field.type === 'image' || field.type === 'pdf')
      .map((field) => ({
        key: field.key,
        accept: field.type === 'pdf' ? 'application/pdf,.pdf' : 'image/*,.gif,.mp4,.webm',
      }));
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

  const totalPages = Math.ceil(listEntries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    return listEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [listEntries, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listQuery]);

  const toggleSelection = (index) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndices(newSet);
  };

  const removeMultipleItems = async () => {
    if (selectedIndices.size === 0) return;
    if (!window.confirm(`Delete ${selectedIndices.size} selected items?`)) return;
    setBusy(true);
    try {
      const indicesToRemove = Array.from(selectedIndices);
      const nextItems = items.filter((_, i) => !indicesToRemove.includes(i));
      setItems(nextItems);
      setSelectedIndices(new Set());
      setSelectedIndex(-1);
      setDraft(formFromItem(section.initialItem, fields, section.initialItem));
      await saveCmsDoc(docId, { [collectionKey]: nextItems });
      setStatus(`${indicesToRemove.length} items deleted.`);
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id, 10);
      const newIndex = parseInt(over.id, 10);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      // Keep selection logically attached to the same item if possible
      if (selectedIndex === oldIndex) {
        setSelectedIndex(newIndex);
      } else if (selectedIndex === newIndex) {
        setSelectedIndex(oldIndex);
      }
      
      setBusy(true);
      try {
        await saveCmsDoc(docId, { [collectionKey]: newItems });
        setStatus('Order saved.');
      } catch {
        setStatus('Failed to save order.');
      } finally {
        setBusy(false);
      }
    }
  };

  if (loading || !draft) {
    return (
      <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 text-text-muted">
        Loading {section.title.toLowerCase()}...
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-secondary/25 p-4 sm:p-6 lg:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md">
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
            <>
              {selectedIndices.size > 0 && (
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                  <span className="text-sm font-medium text-red-300">{selectedIndices.size} selected</span>
                  <button
                    onClick={removeMultipleItems}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-200 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={paginatedEntries.map(e => e.index.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {paginatedEntries.map(({ item, index }) => (
                      <SortableCollectionItem
                        key={index.toString()}
                        id={index.toString()}
                        index={index}
                        item={item}
                        selectedIndex={selectedIndex}
                        editItem={editItem}
                        removeItem={removeItem}
                        sectionTitle={section.title}
                        isSelected={selectedIndices.has(index)}
                        toggleSelection={toggleSelection}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-text disabled:opacity-50 hover:bg-white/5 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-text-muted">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-text disabled:opacity-50 hover:bg-white/5 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
                    field.type === 'image' || field.type === 'file' || field.type === 'pdf'
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
  baseLocation: source.baseLocation ?? initialSiteContent.baseLocation,
  currentFocus: source.currentFocus ?? initialSiteContent.currentFocus,
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
  seoTitle: source.seoTitle ?? initialSiteContent.seoTitle,
  seoDescription: source.seoDescription ?? initialSiteContent.seoDescription,
  seoImage: source.seoImage ?? initialSiteContent.seoImage,
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
                        <option value="" disabled className="bg-secondary text-text">
                          Select {field.label.toLowerCase()}
                        </option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option} className="bg-secondary text-text">
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
                    ) : field.type === 'image' || field.type === 'file' ? (
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex gap-2 min-w-0">
                          <input
                            type="text"
                            value={item.value?.[field.key] ?? ''}
                            onChange={(e) => updateItem(item.id, field.key, e.target.value)}
                            placeholder={field.type === 'image' ? "Enter image URL or upload file" : "Enter file URL or upload file"}
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
                              {field.type === 'image' ? <ImageIcon size={16} /> : <UploadCloud size={16} />}
                            </button>
                          )}
                        </div>
                        {field.type === 'image' && item.value?.[field.key] && (
                          <div className="mt-1 w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-black/20">
                            <img src={item.value[field.key]} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
                          </div>
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
  { id: 'seo', label: 'SEO', hint: 'Global site metadata' },
];


const SiteEditor = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.site, initialSiteContent);
  const [draft, setDraft] = useState(() => normalizeSiteDraft(initialSiteContent));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [siteTab, setSiteTab] = useState('hero');

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
    input.accept = 'image/*,.gif,.mp4,.webm,.ico,.svg';
    input.onchange = async () => {
      let file = input.files?.[0];
      if (!file) return;
      const isCropExempt = file.type === 'image/gif' || file.type === 'image/svg+xml' || file.type === 'image/x-icon' || file.name.endsWith('.ico') || file.name.endsWith('.svg');
      if (file.type.startsWith('image/') && !isCropExempt) {
        try {
          const aspect = key === 'profilePhotoUrl' || key === 'ogImage' || key === 'seoFavicon' ? 1 : 16/9;
          file = await requestImageCrop(file, aspect);
        } catch {
          return;
        }
      }
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
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        seoImage: draft.seoImage,
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
      <div className="space-y-6 p-4 pb-20 sm:p-8 sm:pb-28">
        <SectionBanner
          icon={Settings2}
          title="Website Content"
          help="Configure general website metadata, sections bio text, career statistics, and social handles."
          onSave={save}
          onReset={() => setDraft(normalizeSiteDraft(initialSiteContent))}
          hidePrimarySave
        />

        <AdminStatus message={status} />

        <div className="flex flex-col gap-6 pt-2">
          {/* Horizontal Section Index Navigation Menu */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
            {SITE_CONTENT_TABS.map((tab) => {
              const active = siteTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSiteTab(tab.id)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-xs font-mono whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent/40',
                    active
                      ? 'border-accent/40 bg-accent/15 font-bold text-accent shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.12)]'
                      : 'border-white/10 bg-primary/30 text-text-muted hover:border-accent/25 hover:text-text'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Configuration Form Pane */}
          <div className="space-y-6 min-w-0">
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
                  {['availability', 'contactEmail', 'preferredContact', 'responseSla', 'baseLocation', 'currentFocus', 'bookingUrl', 'cvVersion', 'cvUpdatedAt', 'githubUsername'].map(
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
                description="Manage your bio, profile photo, lists, and structured cards."
              >
                <div className="space-y-12">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent border-b border-white/5 pb-2">Bio & Photo</h4>
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

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent border-b border-white/5 pb-2">Line-item Lists</h4>
                    <div className="grid gap-4">
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
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent border-b border-white/5 pb-2">Structured Cards</h4>
                    <div className="grid gap-4">
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
                  </div>
                </div>
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

            {siteTab === 'seo' && (
              <SiteSection title="SEO & Metadata" description="Manage global title tags, descriptions, and social sharing imagery.">
                <FieldEditor
                  field={{ key: 'seoTitle', label: 'Global Title Tag', type: 'text' }}
                  value={draft.seoTitle}
                  onChange={(value) => updateField('seoTitle', value)}
                />
                <FieldEditor
                  field={{ key: 'seoDescription', label: 'Global Meta Description', type: 'textarea' }}
                  value={draft.seoDescription}
                  onChange={(value) => updateField('seoDescription', value)}
                />
                <FieldEditor
                  field={{ key: 'seoImage', label: 'Global OG Image URL', type: 'image' }}
                  value={draft.seoImage}
                  onChange={(value) => updateField('seoImage', value)}
                  onUpload={() => uploadAsset('seoImage')}
                />
                <FieldEditor
                  field={{ key: 'seoFavicon', label: 'Favicon URL (.ico, .png, .svg)', type: 'image' }}
                  value={draft.seoFavicon}
                  onChange={(value) => updateField('seoFavicon', value)}
                  onUpload={() => uploadAsset('seoFavicon')}
                />
              </SiteSection>
            )}
          </div>
        </div>
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

const AnalyticsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive search & filter states
  const [actionFilter, setActionFilter] = useState('all'); // all, page_view, project_view, click, scroll
  const [searchSession, setSearchSession] = useState('');
  
  // Interactive chart metric range filters
  const [chartMetricFilter, setChartMetricFilter] = useState('page_view'); // page_view, contact_submit, download
  
  // Session trace modal states
  const [selectedTraceSession, setSelectedTraceSession] = useState(null);
  const [pruning, setPruning] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'analyticsEvents'),
      orderBy('timestamp', 'desc'),
      limit(300)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(docs);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to stream telemetry logs:', err);
        setError(`Uplink stream failed: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Pruning handler to wipe out/reset telemetry collection
  const handlePruneLogs = async () => {
    if (!window.confirm('WARNING: Are you sure you want to prune and clear all telemetry data logs? This action is irreversible.')) return;
    setPruning(true);
    try {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      events.forEach((ev) => {
        batch.delete(doc(db, 'analyticsEvents', ev.id));
      });
      await batch.commit();
      alert('Logs successfully pruned.');
    } catch (err) {
      console.error('Pruning failed:', err);
      alert('Failed to clear logs: ' + err.message);
    } finally {
      setPruning(false);
    }
  };

  // Filtered log events computed property
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Action type filter
      if (actionFilter !== 'all') {
        if (actionFilter === 'click' && e.eventName !== 'social_click' && e.eventName !== 'download') return false;
        if (actionFilter === 'scroll' && e.eventName !== 'scroll_depth') return false;
        if (actionFilter === 'page_view' && e.eventName !== 'page_view') return false;
        if (actionFilter === 'project_view' && e.eventName !== 'project_view') return false;
      }
      // 2. Session search filter
      if (searchSession.trim()) {
        const sid = String(e.sessionId || '').toLowerCase();
        const ref = String(e.eventData?.referrer || '').toLowerCase();
        const search = searchSession.toLowerCase();
        if (!sid.includes(search) && !ref.includes(search)) return false;
      }
      return true;
    });
  }, [events, actionFilter, searchSession]);

  // Compiled trace timeline steps for the modal
  const sessionTraceTimeline = useMemo(() => {
    if (!selectedTraceSession) return [];
    return events
      .filter((e) => e.sessionId === selectedTraceSession)
      .sort((a, b) => {
        const tA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const tB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return tA - tB; // oldest first
      });
  }, [events, selectedTraceSession]);

  // Aggregations
  const stats = useMemo(() => {
    if (events.length === 0) return null;

    const formatDate = (ts) => {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toISOString().split('T')[0];
    };

    const totalViews = events.filter((e) => e.eventName === 'page_view').length;
    const totalSessions = new Set(events.map((e) => e.sessionId).filter(Boolean)).size;

    // Estimate live sessions (active within last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const liveSessions = new Set(
      events
        .filter((e) => {
          const t = e.timestamp?.toDate ? e.timestamp.toDate().getTime() : new Date(e.timestamp).getTime();
          return t > fiveMinutesAgo;
        })
        .map((e) => e.sessionId)
        .filter(Boolean)
    ).size;

    // 1. Page views over time (last 7 active days) - filtered by metric choice
    const dailyViews = {};
    events.forEach((e) => {
      if (e.eventName === chartMetricFilter) {
        const dateStr = formatDate(e.timestamp);
        if (dateStr) dailyViews[dateStr] = (dailyViews[dateStr] || 0) + 1;
      }
    });

    // Sort dates
    const sortedDates = Object.keys(dailyViews).sort().slice(-7);
    const dateLabels = sortedDates.map((d) => d.slice(5)); // MM-DD
    const dateData = sortedDates.map((d) => dailyViews[d]);
    const maxDailyView = Math.max(...dateData, 1);

    // 2. Top pages
    const pageCounts = {};
    events.forEach((e) => {
      if (e.eventName === 'page_view' && e.eventData?.path) {
        const p = e.eventData.path;
        pageCounts[p] = (pageCounts[p] || 0) + 1;
      }
    });
    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Scroll depth (funnel)
    const scrollCounts = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 };
    events.forEach((e) => {
      if (e.eventName === 'scroll_depth' && e.eventData?.depth) {
        const depthKey = `${e.eventData.depth}%`;
        if (scrollCounts[depthKey] !== undefined) {
          scrollCounts[depthKey]++;
        }
      }
    });
    const maxScrollCount = Math.max(...Object.values(scrollCounts), 1);

    // 4. Click events (clicks on social networks + resume)
    const clickCounts = {};
    events.forEach((e) => {
      if (e.eventName === 'social_click' && e.eventData?.platform) {
        const p = e.eventData.platform;
        clickCounts[p] = (clickCounts[p] || 0) + 1;
      }
      if (e.eventName === 'download' && e.eventData?.file_type) {
        const d = `resume_${e.eventData.file_type}`;
        clickCounts[d] = (clickCounts[d] || 0) + 1;
      }
    });
    const topClicks = Object.entries(clickCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 5. Top Projects Viewed
    const projectCounts = {};
    events.forEach((e) => {
      if (e.eventName === 'project_view' && e.eventData?.project_title) {
        const title = e.eventData.project_title;
        projectCounts[title] = (projectCounts[title] || 0) + 1;
      }
    });
    const topProjects = Object.entries(projectCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 6. Top geographic country locations (by unique sessions)
    const countryCounts = {};
    const sessionCountryMapped = new Set();
    events.forEach((e) => {
      const country = e.eventData?.country || 'Unknown';
      const key = `${e.sessionId}_${country}`;
      if (e.sessionId && !sessionCountryMapped.has(key)) {
        sessionCountryMapped.add(key);
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalViews,
      totalSessions,
      liveSessions,
      dateLabels,
      dateData,
      maxDailyView,
      topPages,
      scrollCounts,
      maxScrollCount,
      topClicks,
      topProjects,
      topCountries,
    };
  }, [events]);

  // Helper formatting method for Referrer badges
  const getReferrerPill = (referrerUrl) => {
    if (!referrerUrl) return { text: 'Direct / Bookmark', style: 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400' };
    const lowercase = referrerUrl.toLowerCase();
    
    if (lowercase.includes('google.com')) return { text: 'Google SEO', style: 'bg-blue-500/10 border-blue-500/20 text-blue-400' };
    if (lowercase.includes('github.com')) return { text: 'GitHub Link', style: 'bg-purple-500/10 border-purple-500/20 text-purple-400' };
    if (lowercase.includes('linkedin.com')) return { text: 'LinkedIn Referral', style: 'bg-sky-500/10 border-sky-500/20 text-sky-400' };
    if (lowercase.includes('twitter.com') || lowercase.includes('x.com')) return { text: 'X (Twitter)', style: 'bg-zinc-200/10 border-zinc-200/20 text-zinc-300' };
    if (lowercase.includes('localhost') || lowercase.includes('127.0.0.1')) return { text: 'Dev Env Sandbox', style: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' };
    
    try {
      const url = new URL(referrerUrl);
      return { text: url.hostname, style: 'bg-accent/10 border-accent/25 text-accent' };
    } catch {
      return { text: referrerUrl.substring(0, 20), style: 'bg-accent/10 border-accent/25 text-accent' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-text-muted gap-3">
        <RefreshCw className="animate-spin text-accent" size={32} />
        <span className="text-xs uppercase tracking-widest">Downlinking telemetry logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center font-mono">
        <AlertTriangle className="mx-auto mb-4 text-red-400" size={32} />
        <h3 className="text-lg font-bold text-red-200 uppercase tracking-widest">{error}</h3>
        <p className="text-xs text-text-muted mt-2">Check your internet connection or Firestore logs.</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-secondary/20 p-10 text-center font-mono text-text-muted">
        <BarChart2 className="mx-auto mb-4 opacity-50" size={36} />
        <p className="text-sm">No telemetry records exist yet. Navigate around your portfolio to generate logs!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top HUD Cards */}
      <div className="grid gap-4 sm:grid-cols-4 font-mono">
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Total Page Views</span>
          <h3 className="text-2xl font-bold text-accent mt-1">{stats.totalViews}</h3>
        </div>
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Unique Sessions</span>
          <h3 className="text-2xl font-bold text-accent mt-1">{stats.totalSessions}</h3>
        </div>
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold text-emerald-400">Live Active Users</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            {stats.liveSessions} active
          </h3>
        </div>
        <div className="rounded-2xl border border-white/5 bg-secondary/20 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-wider text-text-muted">Database Maintenance</span>
          <button
            onClick={handlePruneLogs}
            disabled={pruning}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-[10px] font-bold text-red-400 transition-colors"
          >
            {pruning ? <RefreshCw size={11} className="animate-spin" /> : <Trash size={11} />}
            Prune Database Logs
          </button>
        </div>
      </div>

      {/* Daily Traffic Chart */}
      <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6 relative overflow-hidden">
        {/* Cyberpunk grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.4))] pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-3 relative z-10">
          <h3 className="font-display font-bold text-text text-xs tracking-wider flex items-center gap-2 text-text-muted">
            <LineChart size={14} className="text-accent animate-pulse" />
            TRAFFIC PROFILE & DATA THROTTLES (7 ACTIVE DAYS)
          </h3>
          
          {/* Chart Metric Selectors */}
          <div className="flex gap-1.5">
            {[
              { id: 'page_view', label: 'Views' },
              { id: 'contact_submit', label: 'Inquiries' },
              { id: 'download', label: 'Downloads' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setChartMetricFilter(btn.id)}
                className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold transition-all border ${
                  chartMetricFilter === btn.id
                    ? 'bg-accent/15 border-accent/35 text-accent'
                    : 'bg-primary/45 border-white/5 text-text-muted hover:border-white/10 hover:text-text'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* SVG Chart */}
        <div className="h-44 w-full flex items-end gap-4 mt-6 border-b border-white/10 pb-2 relative z-10">
          {stats.dateData.map((val, idx) => {
            const pct = (val / stats.maxDailyView) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <span className="absolute -top-7 bg-accent text-primary text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {val} {chartMetricFilter === 'page_view' ? 'views' : chartMetricFilter === 'contact_submit' ? 'inquiries' : 'downloads'}
                </span>
                {/* Bar with cyberpunk double accent glow */}
                <div className="w-full relative flex flex-col justify-end h-full">
                  <div 
                    style={{ height: `${pct || 4}%` }} 
                    className="w-full bg-gradient-to-t from-accent/5 to-accent/30 border border-accent/40 rounded-t-lg group-hover:border-accent group-hover:from-accent/10 group-hover:to-accent/50 shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.15)] group-hover:shadow-[0_0_25px_rgba(var(--color-accent-rgb),0.3)] transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Top scanning pulse line */}
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-accent animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] text-text-muted font-mono mt-2 block whitespace-nowrap">
                  {stats.dateLabels[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Globe size={14} className="text-accent" />
            Top Orbital Pages
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {stats.topPages.map((page, idx) => (
              <div key={idx} className="flex justify-between items-center bg-primary/45 border border-white/5 rounded-xl px-4 py-2.5">
                <span className="text-text truncate">{page.path}</span>
                <span className="text-accent font-bold">{page.count} hits</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Funnel */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
            <LineChart size={14} className="text-accent" />
            Scroll Retention Funnel
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {Object.entries(stats.scrollCounts).map(([depth, count]) => {
              const pct = (count / stats.maxScrollCount) * 100;
              return (
                <div key={depth} className="flex items-center gap-4">
                  <span className="w-10 text-right text-text-muted text-[10px] font-bold">{depth}</span>
                  <div className="flex-1 h-3 bg-secondary/50 rounded overflow-hidden border border-white/5 relative p-[1px]">
                    <div 
                      style={{ width: `${pct || 0}%` }}
                      className="h-full bg-gradient-to-r from-accent/60 to-accent rounded"
                    />
                  </div>
                  <span className="w-24 text-accent text-right font-bold text-[10px]">
                    {count} logs ({Math.round(pct)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Click events */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted">OUTBOUND ACTIONS (CLICKS & DOWNLOADS)</h3>
          <div className="space-y-3 font-mono text-xs">
            {stats.topClicks.map((click, idx) => (
              <div key={idx} className="flex justify-between items-center bg-primary/45 border border-white/5 rounded-xl px-4 py-2.5">
                <span className="text-text-muted capitalize">{click.name.replace('_', ' ')}</span>
                <span className="text-accent font-bold">{click.count} clicks</span>
              </div>
            ))}
            {stats.topClicks.length === 0 && (
              <p className="text-center text-text-muted text-xs py-4">No outbound logs yet.</p>
            )}
          </div>
        </div>

        {/* Top Projects */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5">
          <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Folder size={14} className="text-accent" />
            POPULAR MISSIONS (PROJECT VIEWS)
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {stats.topProjects.map((proj, idx) => (
              <div key={idx} className="flex justify-between items-center bg-primary/45 border border-white/5 rounded-xl px-4 py-2.5">
                <span className="text-text truncate">{proj.title}</span>
                <span className="text-accent font-bold">{proj.count} views</span>
              </div>
            ))}
            {stats.topProjects.length === 0 && (
              <p className="text-center text-text-muted text-xs py-4">No project view logs yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Geographic Activity World Map Card */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-text text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Globe size={14} className="text-emerald-400 animate-pulse" />
                Geographic Activity Radar
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                Live Resolution
              </span>
            </div>

            {/* High-fidelity Google GeoChart Canvas Wrapper */}
            <div className="w-full h-44 bg-primary/25 border border-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center p-2">
              <div id="geochart_canvas" className="w-full h-full select-none" />
              
              {/* Load geochart library scripts dynamically */}
              <GeoChartLoader activeCountries={stats.topCountries} />
            </div>
          </div>

          {/* Simple Legend */}
          <div className="flex gap-4 mt-3 text-[10px] font-mono text-text-muted justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-emerald-500" />
              Active Uplink Sector
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-zinc-800 border border-white/5" />
              No Telemetry Reported
            </span>
          </div>
        </div>

        {/* Geographic Breakdown Lists */}
        <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-text mb-4 text-sm uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Globe size={14} className="text-accent" />
              Top Active Sectors
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {stats.topCountries.map((c, idx) => {
                const maxVal = Math.max(...stats.topCountries.map(o => o.count), 1);
                const pct = (c.count / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text font-bold">{c.name}</span>
                      <span className="text-accent font-bold">{c.count} sessions</span>
                    </div>
                    <div className="h-2 bg-secondary/50 rounded overflow-hidden border border-white/5 relative p-[1px]">
                      <div 
                        style={{ width: `${pct || 0}%` }}
                        className="h-full bg-gradient-to-r from-accent/60 to-accent rounded"
                      />
                    </div>
                  </div>
                );
              })}
              {stats.topCountries.length === 0 && (
                <p className="text-center text-text-muted text-xs py-4">Resolving geo metrics...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream Recent Activity Log Feed Terminal */}
      <div className="rounded-2xl border border-white/10 bg-secondary/20 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-3">
          <h3 className="font-display font-bold text-text text-xs tracking-wider flex items-center gap-2 text-text-muted">
            <Terminal size={14} className="text-accent" />
            REALTIME TELEMETRY LOGS (RECENT ACTIVITY)
          </h3>
          
          {/* Action Filter Controls */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'page_view', label: 'Views' },
              { id: 'project_view', label: 'Projects' },
              { id: 'click', label: 'Outbound' },
              { id: 'scroll', label: 'Scroll' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActionFilter(btn.id)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all border ${
                  actionFilter === btn.id
                    ? 'bg-accent/15 border-accent/35 text-accent'
                    : 'bg-primary/45 border-white/5 text-text-muted hover:border-white/10 hover:text-text'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Filter Search Input */}
        <div className="flex items-center gap-2 bg-primary/30 border border-white/5 rounded-xl px-3 py-2">
          <Search size={12} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search logs by Session ID or Referrer domain..."
            value={searchSession}
            onChange={(e) => setSearchSession(e.target.value)}
            className="w-full bg-transparent text-xs text-text outline-none placeholder-text-muted/65"
          />
          {searchSession && (
            <button onClick={() => setSearchSession('')} className="text-text-muted hover:text-text">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Interactive Log Feed list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 [scrollbar-width:thin] font-mono text-[11px] text-text-muted">
          {filteredEvents.slice(0, 60).map((log) => {
            const time = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : 'Recent';
            let eventText = '';
            
            if (log.eventName === 'page_view') {
              eventText = `Page View: "${log.eventData?.path || '/'}"`;
            } else if (log.eventName === 'project_view') {
              eventText = `Viewed Project: "${log.eventData?.project_title || 'N/A'}"`;
            } else if (log.eventName === 'social_click') {
              eventText = `Clicked Social Link: "${log.eventData?.platform || 'N/A'}"`;
            } else if (log.eventName === 'download') {
              eventText = `Downloaded Resume: [${log.eventData?.file_type?.toUpperCase() || 'PDF'}]`;
            } else if (log.eventName === 'scroll_depth') {
              eventText = `Scrolled through ${log.eventData?.depth || '0'}% of Homepage`;
            } else if (log.eventName === 'contact_submit') {
              eventText = `Submitted Inquiry Form`;
            } else {
              eventText = `Triggered Event: ${log.eventName}`;
            }

            const referrerPill = getReferrerPill(log.eventData?.referrer);

            return (
              <div 
                key={log.id} 
                onClick={() => setSelectedTraceSession(log.sessionId)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/35 border border-white/5 rounded-xl px-4 py-3 hover:bg-primary/50 hover:border-accent/25 transition-all cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <span className="text-[10px] text-accent font-bold shrink-0">[{time}]</span>
                  <span className="text-text truncate font-semibold group-hover:text-accent transition-colors">{eventText}</span>
                </div>
                
                <div className="flex items-center flex-wrap gap-2.5 text-[10px] text-text-muted/65 self-end sm:self-center">
                  {/* Referrer source badge */}
                  <span className={`px-2 py-0.5 rounded border text-[9px] ${referrerPill.style}`}>
                    {referrerPill.text}
                  </span>
                  <span>•</span>
                  {/* Device Indicator */}
                  <span className="flex items-center gap-1">
                    <Laptop size={10} />
                    {log.eventData?.device || 'Desktop'}
                  </span>
                  <span>•</span>
                  {/* Short Session footprint */}
                  <span className="bg-white/5 px-1.5 py-0.5 rounded group-hover:bg-accent/15 group-hover:text-accent transition-colors font-bold">
                    Trace: {log.sessionId?.substring(0, 6) || 'Guest'}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <p className="text-center text-text-muted py-8 text-xs font-mono">No telemetry events match your active filters.</p>
          )}
        </div>
      </div>

      {/* SESSION TRACE WORKSPACE TIMELINE MODAL */}
      {selectedTraceSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-secondary p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div>
                <h4 className="text-sm font-display font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-accent animate-pulse" />
                  User Session Trace
                </h4>
                <p className="text-[10px] font-mono text-text-muted mt-1 break-all select-all">
                  Session ID: {selectedTraceSession}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTraceSession(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Trace Steps Scroll Timeline */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 [scrollbar-width:thin] py-2">
              {sessionTraceTimeline.map((step) => {
                const stepTime = step.timestamp?.toDate ? step.timestamp.toDate().toLocaleTimeString() : 'Recent';
                let stepAction = '';
                let details = null;

                if (step.eventName === 'page_view') {
                  stepAction = `Opened Page "${step.eventData?.path || '/'}"`;
                  details = step.eventData?.referrer ? `Referrer: ${step.eventData.referrer}` : null;
                } else if (step.eventName === 'project_view') {
                  stepAction = `Opened Project Modal`;
                  details = `Project: ${step.eventData?.project_title || 'Unknown'}`;
                } else if (step.eventName === 'social_click') {
                  stepAction = `Clicked Social Link`;
                  details = `Platform: ${step.eventData?.platform || 'Unknown'}`;
                } else if (step.eventName === 'download') {
                  stepAction = `Downloaded Resume`;
                  details = `File Type: ${step.eventData?.file_type?.toUpperCase() || 'N/A'}`;
                } else if (step.eventName === 'scroll_depth') {
                  stepAction = `Scrolled Page`;
                  details = `Depth reached: ${step.eventData?.depth || '0'}%`;
                } else if (step.eventName === 'contact_submit') {
                  stepAction = `Sent Contact Inquiry Form`;
                } else {
                  stepAction = `Triggered: ${step.eventName}`;
                }

                return (
                  <div key={step.id} className="relative pl-6 border-l border-white/10 last:border-transparent pb-1">
                    {/* Circle Node Indicator */}
                    <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-accent shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.5)]" />
                    
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-accent font-bold">[{stepTime}]</span>
                        <span className="text-xs text-text font-semibold">{stepAction}</span>
                      </div>
                      {details && (
                        <p className="text-[10px] font-mono text-text-muted mt-0.5 leading-relaxed bg-primary/25 border border-white/5 rounded px-2 py-1 select-all">
                          {details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center text-[10px] font-mono text-text-muted">
              <span className="flex items-center gap-1">
                <Clock size={11} /> Total Actions: {sessionTraceTimeline.length}
              </span>
              <button
                onClick={() => setSelectedTraceSession(null)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/80 border border-white/10 text-xs font-bold text-text transition-colors"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GeoChartLoader = ({ activeCountries = [] }) => {
  useEffect(() => {
    let active = true;

    const drawChart = () => {
      if (!active || !window.google || !window.google.visualization) return;

      const container = document.getElementById('geochart_canvas');
      if (!container) return;

      const dataArray = [['Country', 'Active Sessions']];
      activeCountries.forEach((c) => {
        // Exclude Unknown markers from coloring
        if (c.name !== 'Unknown') {
          dataArray.push([c.name, c.count]);
        }
      });

      // Default to empty marker if no sessions
      if (dataArray.length === 1) {
        dataArray.push(['US', 0]);
      }

      const data = window.google.visualization.arrayToDataTable(dataArray);

      const options = {
        colorAxis: { colors: ['#0f172a', '#10b981', '#34d399'] }, // Dark bg transition to emerald theme accent color
        backgroundColor: 'transparent',
        datalessRegionColor: '#1e293b', // Matches dark secondary background
        defaultColor: '#1e293b',
        keepAspectRatio: true,
        tooltip: { textStyle: { color: '#f8fafc', fontName: 'monospace', fontSize: 11 }, trigger: 'focus' },
      };

      const chart = new window.google.visualization.GeoChart(container);
      chart.draw(data, options);
    };

    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        window.google.charts.load('current', {
          packages: ['geochart'],
          mapsApiKey: '', // GA Geocharts do not require an active API key for basic loads
        });
        window.google.charts.setOnLoadCallback(drawChart);
      }
    };

    // Load Google Charts JS Loader if not already in document
    if (!document.getElementById('google-charts-script')) {
      const script = document.createElement('script');
      script.id = 'google-charts-script';
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.onload = loadGoogleCharts;
      document.body.appendChild(script);
    } else {
      loadGoogleCharts();
    }

    // Handle window resize dynamically to adjust vector map scale
    const handleResize = () => {
      if (window.google && window.google.visualization) {
        drawChart();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      active = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [activeCountries]);

  return null;
};

const AdminPage = () => {
  const { user, loading } = useAuthState();
  const [activeTab, setActiveTab] = useState('site');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Live query listener to update unread badge on message reception
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, CMS_DOCS.messages));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter(doc => !doc.data().read).length;
      setUnreadCount(unread);
    });
    return () => unsubscribe();
  }, [user]);

  const tabGroups = [
    {
      label: '⚡ Telemetry & Inbox',
      items: [
        { id: 'analytics', label: 'Analytics Feed', icon: LineChart },
        { id: CMS_DOCS.messages, label: 'Inbox Messages', icon: Mail, badge: unreadCount },
      ],
    },
    {
      label: '⚙️ Global Configuration',
      items: [
        { id: 'site', label: 'Website Content', icon: Settings2 },
        { id: 'media', label: 'Media Library', icon: ImageIcon },
      ],
    },
    {
      label: '📁 Content Collections',
      items: [
        { id: CMS_DOCS.projects, label: 'Projects List', icon: Folder },
        { id: CMS_DOCS.services, label: 'Services Config', icon: Briefcase },
        { id: CMS_DOCS.certifications, label: 'Certificates', icon: Award },
        { id: CMS_DOCS.skills, label: 'Skills Layout', icon: Wrench },
        { id: CMS_DOCS.experience, label: 'Work Experience', icon: Sparkles },
        { id: CMS_DOCS.blog, label: 'Blog Posts', icon: BookOpen },
        { id: CMS_DOCS.testimonials, label: 'Testimonials', icon: Quote },
        { id: CMS_DOCS.openSource, label: 'Open Source', icon: Github },
        { id: CMS_DOCS.resources, label: 'Resources Archive', icon: LinkIcon },
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
      <div className="min-h-screen flex items-center justify-center bg-primary bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgb(var(--color-accent-rgb)/0.1),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgb(var(--color-accent-rgb)/0.05),transparent)] px-4 py-10 text-text sm:py-14">
        <div className="w-full max-w-6xl grid gap-8 xl:grid-cols-[1fr_1.02fr] xl:items-stretch">
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
    <div className="h-screen w-screen flex overflow-hidden bg-primary bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgb(var(--color-accent-rgb)/0.07),transparent)] text-text">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR (Zero Scroll Layout Shift) */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-primary/95 backdrop-blur-2xl border-r border-white/10 p-6 transition-transform duration-300 ease-in-out lg:static lg:w-72 lg:transform-none lg:bg-secondary/20 lg:backdrop-blur-md shrink-0 h-full",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-accent/25 bg-accent/10 p-2.5 text-accent">
              <Shield size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">Console</p>
              <h1 className="text-sm font-bold tracking-tight text-text">CMS Dashboard</h1>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Area inside Sidebar */}
        <nav
          className="flex-1 overflow-y-auto space-y-5 pr-1 [scrollbar-width:thin]"
          aria-label="Admin sections"
        >
          {tabGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-[9px] font-mono uppercase tracking-[0.18em] text-text-muted/65">
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
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors group/tab',
                        isActive
                          ? 'border border-accent/35 bg-accent/15 font-semibold text-accent shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.08)]'
                          : 'border border-transparent text-text-muted hover:border-white/10 hover:bg-primary/45 hover:text-text'
                      )}
                    >
                      <Icon size={15} strokeWidth={1.75} className={isActive ? 'text-accent' : 'opacity-70'} />
                      <span className="truncate flex-1">{tab.label}</span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="shrink-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-[9px] font-bold text-primary font-mono shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.4)] animate-pulse">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pinned user profile footer inside Sidebar */}
        <div className="mt-auto pt-4 border-t border-white/5 shrink-0">
          <p className="text-[10px] truncate text-text-muted leading-tight">Signed in as:</p>
          <p className="text-xs font-bold text-text truncate mt-1">{user.email}</p>
        </div>
      </aside>

      {/* INDEPENDENT CONTENT AREA (Only this part scrolls) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Panel */}
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-secondary/35 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-text truncate">{activeSection.label}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-primary/30 px-3 sm:px-4 py-2 text-xs font-semibold text-text transition-colors hover:border-accent/35 hover:bg-primary/55"
              aria-label="View site"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 sm:px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
              aria-label="Sign out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Work Workspace Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 [scrollbar-width:thin]">
          {activeSection.id === 'site' && <SiteEditor />}
          {activeSection.id === 'media' && <MediaLibrary />}
          {activeSection.id === CMS_DOCS.messages && <MessagesInbox />}
          {activeSection.id === 'analytics' && <AnalyticsDashboard />}
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
      <CropModalRoot />
    </div>
  );
};

export default AdminPage;
