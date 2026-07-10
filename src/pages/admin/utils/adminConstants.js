export const initialSiteContent = {
  layoutJson: [
  {
    "id": "Hero",
    "type": "Hero",
    "enabled": true
  },
  {
    "id": "About",
    "type": "About",
    "enabled": true
  },
  {
    "id": "Skills",
    "type": "Skills",
    "enabled": true
  },
  {
    "id": "Experience",
    "type": "Experience",
    "enabled": true
  },
  {
    "id": "Projects",
    "type": "Projects",
    "enabled": true
  },
  {
    "id": "Certifications",
    "type": "Certifications",
    "enabled": true
  },
  {
    "id": "Contact",
    "type": "Contact",
    "enabled": true
  }
],

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
  avatarPhotoUrl: '',
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
  headerLinksJson: JSON.stringify(
    [
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Services', href: '/services' },
      { label: 'Resume', href: '/resume' },
      { label: 'Contact', href: '/contact' }
    ],
    null,
    2
  ),
  footerLinksJson: JSON.stringify(
    [
      { label: 'Projects', href: '/projects' },
      { label: 'Blog', href: '/blog' },
      { label: 'Open Source', href: '/open-source' },
      { label: 'Resources', href: '/resources' },
      { label: 'Admin', href: '/admin' }
    ],
    null,
    2
  ),
  seoTitle: 'Sahan Pramuditha | Software Engineer and Creative Developer',
  seoDescription: 'Sahan Pramuditha is a software engineer and creative developer building accessible, high-performance digital experiences.',
  seoImage: '',
  seoFavicon: '',
};

export const initialExperienceItem = {
  type: 'work',
  title: '',
  organization: '',
  location: '',
  period: '',
  description: '',
  skills: [],
};

export const getAuthErrorMessage = (error) => {
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

export const getCmsErrorMessage = (error) => {
  if (!(error instanceof Error)) {
    return 'Failed to save content.';
  }

  if (error.code === 'permission-denied') {
    return 'Firestore blocked the save. Sign in with the owner account or add this email to the admins collection.';
  }

  return error.message || 'Failed to save content.';
};

export const isLikelyAssetUrl = (value) => {
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

export const collectMediaValidationErrors = (item, fields) => {
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

export const initialProject = {
  layoutJson: [
    { id: 'Hero', enabled: true },
    { id: 'ProblemStatement', enabled: true },
    { id: 'ProductOverview', enabled: true },
    { id: 'KeyFeatures', enabled: true },
    { id: 'InteractiveDemo', enabled: true },
    { id: 'UserJourney', enabled: true },
    { id: 'ArchitectureOverview', enabled: true },
    { id: 'EngineeringDecisions', enabled: true },
    { id: 'TechnicalChallenges', enabled: true },
    { id: 'SecurityPerformance', enabled: true },
    { id: 'ScalabilityStrategy', enabled: true },
    { id: 'DevelopmentTimeline', enabled: true },
    { id: 'MetricsStatistics', enabled: true },
    { id: 'LessonsLearned', enabled: true },
    { id: 'FutureRoadmap', enabled: true },
    { id: 'CTA', enabled: true }
  ],
  missionCode: '',
  year: new Date().getFullYear(),
  title: '',
  shortDescription: '',
  valueProposition: '',
  description: '',
  architecture: '',
  architectureImage: '',
  features: [],
  featuresJson: [],
  learned: '',
  impactMetricsJson: [],
  developmentAnalyticsJson: [],
  timelineJson: [],
  tech: [],
  techStackJson: [],
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
  challengesJson: [],
  repoInsights: '',
  testimonialsJson: [],
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
  // Redesigned Case Study Fields
  heroSubtitle: '',
  heroStatsJson: [],
  heroVideoUrl: '',
  heroImageUrl: '',
  heroThreeJsBg: 'wireframeGlobe',
  showLiveSandbox: true,
  overviewParagraphs: '',
  overviewCardsJson: [],
  objectivesJson: [],
  beforeAfterJson: [],
  storyMilestonesJson: [],
  architectureNodesJson: [],
  architectureConnectionsJson: [],
  architectureMarkdown: '',
  folderStructure: '',
  databaseSchemaJson: [],
  databaseDesignMarkdown: '',
  apiEndpointsJson: [],
  authenticationFlow: '',
  userJourneyJson: [],
  scalabilityStrategyJson: [],
  engineeringDecisionsJson: [],
  performanceMetricsJson: [],
  roadmapJson: [],
  videosJson: [],
  lessonsLearnedJson: [],
  deploymentMarkdown: '',
  ctaJson: {},
  benchmarksJson: [],
  terminalCommandsJson: [],
  technicalFaqJson: [],
  relatedProjects: '',
};


export const initialCertificate = {
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

export const initialSkillGroup = {
  title: '',
  order: 0,
  skillsJson: [],
};

export const initialResource = {
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

export const initialBlogPost = {
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

export const initialTestimonial = {
  name: '',
  role: '',
  company: '',
  content: '',
  rating: 5,
  context: '',
  link: '',
};

export const initialService = {
  title: '',
  summary: '',
  scope: '',
  timeline: '',
  deliverables: '',
  cta: '',
  featured: false,
};

export const initialOpenSource = {
  name: '',
  category: 'Other',
  status: 'Active',
  pinned: false,
  hidden: false,
  difficulty: 'None',
  customDescription: '',
};

export const initialFaq = {
  question: '',
  answer: '',
  status: 'Published',
};

export const initialMaintenancePlan = {
  title: '',
  price: '',
  recommended: false,
  features: [],
};

