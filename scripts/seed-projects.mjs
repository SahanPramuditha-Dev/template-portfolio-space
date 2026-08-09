import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y',
  authDomain: 'sahanpramuditha-portfolio.firebaseapp.com',
  projectId: 'sahanpramuditha-portfolio',
  storageBucket: 'sahanpramuditha-portfolio.firebasestorage.app',
  messagingSenderId: '180340771122',
  appId: '1:180340771122:web:e0ddfe5fc4d66991d72f2b',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const projectsSeed = {
  items: [
    {
      missionCode: 'PRJ001',
      year: 2026,
      title: 'StudyOS',
      slug: 'studyos',
      shortDescription: 'AI-powered student productivity and development operating system.',
      valueProposition: 'An all-in-one centralized digital workspace for notes, course tracking, and code projects.',
      category: 'Web Apps',
      status: 'Live',
      client: 'Personal Research / University of Colombo',
      industry: 'EdTech / Productivity Tools',
      teamSize: '1 (Sole Developer)',
      projectTimeline: '12 Months (2025 - 2026)',
      outcomeBadge: 'Reduced Student Context Switching by 70%',
      featured: true,
      completed: true,
      projectType: 'personal',
      isPrivate: false,
      github: 'https://github.com/SahanPramuditha-Dev/StudyOS',
      external: 'https://studyos-demo.vercel.app',
      demoEmail: 'demo@studyos.io',
      demoPassword: 'studyospassword123',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          caption: 'StudyOS Single-Pane Student Workspace Dashboard',
          alt: 'Dashboard showcasing course modules, upcoming deadlines, and git activity panels.',
          group: 'Desktop'
        },
        {
          url: 'https://images.unsplash.com/photo-1618005198143-e528346d9a59?auto=format&fit=crop&w=800&q=80',
          caption: 'Course note editor with integrated markdown rendering and sidebar directory trees',
          alt: 'Markdown note editor layout showing course notes.',
          group: 'Desktop'
        },
        {
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          caption: 'StudyOS Mobile layout viewport showing active deadline schedules',
          alt: 'Mobile layout showing scheduled notifications and reminder checklist cards.',
          group: 'Mobile'
        }
      ],
      documents: [
        { name: 'StudyOS Technical Overview PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { name: 'System Architecture Slides', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ],
      description: 'StudyOS addresses the fragmentation in student and developer academic workflows. Currently, individuals are forced to split their concentration between separate platforms for document writing, project tracking, assignment deadlines, and git updates, causing severe cognitive overhead and context switching. By centralizing these core operations into a high-performance single-page workspace with low-latency syncing, StudyOS restores deep focus to study sessions.',
      role: 'Full-Stack Software Architect & UX Designer',
      problem: 'Student developers currently track academic items in Notion, assignments in Google Sheets, software issues in Github, and code logs in separate terminals. This results in constant context-switching lag, lost files, and missed calendar deadlines due to scattered notification channels.',
      solution: 'StudyOS unifies these services by implementing a responsive single-pane application. Integrating Google Calendar APIs for schedules, GitHub API logs for project repositories, and a local Firestore sync layer for markdown note databases, StudyOS organizes academic workloads in a unified workspace.',
      
      // REDESIGNED CASE STUDY FIELDS
      heroSubtitle: 'The ultimate digital workspace combining notes, files, schedules, and Git repositories.',
      heroStatsJson: [
        { value: '70', label: 'Context Switch Reduction', suffix: '%' },
        { value: '50', label: 'Task Management Efficiency', suffix: '%' },
        { value: '80', label: 'Deadline Miss Reduction', suffix: '%' }
      ],
      heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34316-large.mp4',
      heroImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      heroThreeJsBg: 'wireframeGlobe',
      overviewParagraphs: 'StudyOS represents an engineering response to the fragmented digital workspace. By implementing a high-performance Single Page Application using React 19, Vite, and Cloud Firestore, StudyOS enables developers and students to maintain focus within a unified dashboard. The UI alternates strategically between wide layouts, statistics dashboards, and code previews, avoiding layout fatigue and enhancing exploration.',
      overviewCardsJson: [
        { icon: 'Zap', title: 'Ultra-Fast Performance', description: 'Zero-overhead React states keep transition latencies below 50ms.' },
        { icon: 'Shield', title: 'Granular Security', description: 'Strict database security rules protect personal files and oauth sync tokens.' },
        { icon: 'Cpu', title: 'Seamless Integrations', description: 'Real-time synchronization with Google Calendar and GitHub repository APIs.' }
      ],
      objectivesJson: [
        { title: 'Reduce Switch Overhead', description: 'Limit student workspace actions to a single browser window.' },
        { title: 'Offline-First Syncing', description: 'Provide complete note editing and task updates during network disruptions.' },
        { title: 'Maintain 60 FPS Dials', description: 'Render particle backgrounds and charts at native refresh rates.' }
      ],
      beforeAfterJson: [
        { label: 'Fragmented Tools', description: 'Opening Notion for notes, Sheets for tasks, and Github for code logs.', state: 'before', imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80' },
        { label: 'Unified Control', description: 'All database updates, note editing, and repository logs in one window.', state: 'after', imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80' }
      ],
      storyMilestonesJson: [
        { date: 'Dec 2025', title: 'Product Conception', description: 'Conducted user research and designed interactive Figma wireframes.', badge: 'Phase 1', status: 'completed' },
        { date: 'Jan 2026', title: 'Database & Auth Layer', description: 'Configured Firebase Auth and set up NoSQL collection paths.', badge: 'Phase 2', status: 'completed' },
        { date: 'Feb 2026', title: 'Core API Integration', description: 'Completed secure sync hooks with Google Calendar & Github APIs.', badge: 'Phase 3', status: 'completed' },
        { date: 'Mar 2026', title: 'Beta Release & Audit', description: 'Shared with 50+ university students. Achieved 99 Lighthouse scores.', badge: 'Phase 4', status: 'completed' }
      ],
      architectureNodesJson: [
        { id: 'user', label: 'User Client', desc: 'React web interface rendering dashboard viewports.', icon: 'Smartphone', x: 10, y: 50, color: '#38bdf8' },
        { id: 'cdn', label: 'Vercel CDN', desc: 'Edge servers delivering static chunks globally.', icon: 'Globe', x: 30, y: 50, color: '#10b981' },
        { id: 'auth', label: 'Firebase Auth', desc: 'Secure oauth handles and password authentication.', icon: 'Shield', x: 50, y: 25, color: '#ec4899' },
        { id: 'gateway', label: 'API Gateway', desc: 'Serverless functions orchestrating API queries.', icon: 'Cpu', x: 50, y: 75, color: '#f59e0b' },
        { id: 'db', label: 'Cloud Firestore', desc: 'Low-latency real-time database collection store.', icon: 'Database', x: 75, y: 50, color: '#a855f7' },
        { id: 'storage', label: 'Asset Storage', desc: 'Cloud storage buckets holding uploaded documents.', icon: 'HardDrive', x: 90, y: 50, color: '#ef4444' }
      ],
      architectureConnectionsJson: [
        { from: 'user', to: 'cdn', color: '#38bdf8' },
        { from: 'cdn', to: 'auth', color: '#ec4899' },
        { from: 'cdn', to: 'gateway', color: '#f59e0b' },
        { from: 'gateway', to: 'db', color: '#a855f7' },
        { from: 'gateway', to: 'storage', color: '#ef4444' }
      ],
      architectureMarkdown: 'StudyOS leverages a serverless cloud topology to maintain performance and scale. Static assets and routing bundle paths are cached at Vercel Edge endpoints. Direct data streams map straight between the client browser and Cloud Firestore via real-time listeners, which bypasses proxy latency. Heavy sync jobs (like calendar token exchanges and Git log polling) are delegated to secure Google Cloud Functions operating behind our API Gateway.',
      folderStructure: `studyos/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── MarkdownEditor.jsx
│   │   └── CalendarGrid.jsx
│   ├── context/
│   │   ├── WorkspaceContext.jsx
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useFirestoreSync.js
│   │   └── useCalendarApi.js
│   ├── App.jsx
│   └── main.jsx
├── firebase.json
├── package.json
└── vite.config.js`,
      databaseSchemaJson: [
        { table: 'courses', description: 'Academic course containers', columns: 'uid: string (PK)\ntitle: string\ncode: string\ninstructor: string\ncolor: string' },
        { table: 'tasks', description: 'Assignments and tasks logs', columns: 'id: string (PK)\ncourseId: string (FK)\ntitle: string\ndueDate: timestamp\nstatus: string\npriority: string' },
        { table: 'notes', description: 'Rich-text markdown study materials', columns: 'id: string (PK)\ncourseId: string (FK)\ntitle: string\ncontent: string\nlastUpdated: timestamp' }
      ],
      databaseDesignMarkdown: 'Our database design structures data in a hierarchical NoSQL layout. The top-level collections represent core workspaces. Sub-collections are avoided where queries require cross-boundary grouping, utilizing flat root collections with strong query indexing filters instead. This optimizes read costs in Firestore.',
      apiEndpointsJson: [
        { name: 'Fetch Courses', endpoint: '/api/v1/courses', method: 'GET', description: 'Returns schedule data and modules of active courses.', requestFormat: '{}', responseFormat: '{\n  "status": "success",\n  "courses": [\n    { "uid": "CS101", "title": "Advanced Algorithmic Logic" }\n  ]\n}' },
        { name: 'Create Task', endpoint: '/api/v1/tasks', method: 'POST', description: 'Inserts a new assignment into the user schedule.', requestFormat: '{\n  "title": "Build SVG Flow diagram",\n  "courseId": "CS101",\n  "dueDate": "2026-08-12T00:00:00Z"\n}', responseFormat: '{\n  "status": "created",\n  "taskId": "task_abc890"\n}' }
      ],
      authenticationFlow: 'Authentication uses OAuth 2.0 flow. Users authenticate via Firebase with Google Credentials, which issues a JWT session token. When sync features with Google Calendar are activated, additional calendar read/write scope permissions are requested. The OAuth refresh tokens are stored in double-encrypted Firestore fields.',
      engineeringDecisionsJson: [
        { question: 'Should we store rich note contents in Firestore or Cloud Storage?', decision: 'Firestore document fields', reason: 'Allows atomic real-time updates and direct client query filtering without initiating secondary HTTP requests.', alternatives: 'JSON blobs in Storage buckets', tradeOffs: 'Firestore document size is capped at 1MB, but study notes rarely exceed 200KB. Bypassing bucket latency saves ~250ms per load.' },
        { question: 'What state management pattern should be used for editor layouts?', decision: 'React Context with custom hooks', reason: 'Editor views require shared context across multiple panels. React Context handles these view states with minimal bundle size.', alternatives: 'Redux Toolkit, Zustand', tradeOffs: 'Zustand is lightweight but native Context keeps bundle dependencies down, ensuring faster load speeds.' }
      ],
      performanceMetricsJson: [
        { label: 'Bundle Size', value: '142 KB', detail: 'Vite code-splitting removes non-critical vendor modules on initial paint.', status: 'pass' },
        { label: 'First Contentful Paint', value: '0.6s', detail: 'Pre-rendered static index shell loads immediately from edge node.', status: 'pass' },
        { label: 'Frame Rate (FPS)', value: '60 FPS', detail: 'Framer Motion uses GPU transform attributes for smooth scrolling.', status: 'pass' }
      ],
      roadmapJson: [
        { task: 'Integrate OpenAI Vector Search for Study Notes', priority: 'High', status: 'Todo', release: 'Q3 2026' },
        { task: 'Cross-platform Mobile Companion (Capacitor)', priority: 'Medium', status: 'In Progress', release: 'Q4 2026' },
        { task: 'Collaborative real-time shared study documents', priority: 'Low', status: 'Todo', release: 'Q1 2027' }
      ],
      videosJson: [
        { url: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-typing-message-closeup-41551-large.mp4', caption: 'Mobile responsiveness and responsive list previews', title: 'StudyOS Mobile Walkthrough' }
      ],
      lessonsLearnedJson: [
        { title: 'Throttle Heavy Listener Syncs', description: 'Binding direct listeners to massive document arrays causes query bills to skyrocket. Implementing state debounces reduced read costs by 45%.', icon: 'AlertTriangle' },
        { title: 'Simplify Layout Interactivity', description: 'Over-animating components harms usability. Restricting animations to clean entry transitions and micro-hover states keeps UI feeling professional.', icon: 'CheckCircle' }
      ],
      deploymentMarkdown: 'StudyOS relies on a modern CI/CD deployment chain. Every push to `main` triggers a Github Actions workflow that runs ESLint checks, Jest testing suites, and builds the distribution folder. Once passed, Vite compiles static assets and deploys them to Vercel global hosting nodes immediately.',
      ctaJson: {
        title: 'Ready to upgrade your focus?',
        subtitle: 'Launch the StudyOS portal instantly in sandbox mode, or explore the fully open-source React repository on GitHub.',
        buttonText: 'LAUNCH PORTAL',
        buttonUrl: 'https://studyos-demo.vercel.app',
        secondaryButtonText: 'VIEW GITHUB',
        secondaryButtonUrl: 'https://github.com/SahanPramuditha-Dev/StudyOS',
        backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
      },
      relatedProjects: 'quantum-ledger,stardust-engine',
      benchmarksJson: [
        { metricName: 'API Response Latency', oldValue: '450', newValue: '65', unit: 'ms', betterDirection: 'lower' },
        { metricName: 'Initial Bundle Overhead', oldValue: '580', newValue: '142', unit: 'KB', betterDirection: 'lower' },
        { metricName: 'Lighthouse Performance Score', oldValue: '74', newValue: '99', unit: '', betterDirection: 'higher' }
      ],
      terminalCommandsJson: [
        { commandTitle: 'Run Setup', commandPrompt: 'npm run setup', outputLogs: 'Initializing workspace environment configurations...\nChecking yarn lockfiles...\nResolving packages metadata...\n✔ Setup completed successfully.' },
        { commandTitle: 'Trigger Build', commandPrompt: 'npm run build', outputLogs: 'vite v7.3.6 building for production...\n✓ 2871 modules transformed.\nrendering client env...\ndist/index.html   5.37 kB\ndist/assets/index.js   276.42 kB\n✔ Client build bundled successfully.' },
        { commandTitle: 'Push to Prod', commandPrompt: 'firebase deploy --only hosting', outputLogs: '=== Deploying to "sahanpramuditha-portfolio"...\nHosting: uploading static assets...\nHosting: released hosting target path...\n✔ Deploy complete!' }
      ],
      technicalFaqJson: [
        { question: 'Why choose Cloud Firestore over custom WebSockets?', answer: 'Firestore provides an out-of-the-box offline cache sync layer, auto-reconnect listeners, and global edge caching, significantly reducing initial build overhead and deployment costs compared to hosting custom WebSocket servers.' },
        { question: 'How is data security handled for calendar access?', answer: 'We delegate token exchanges to encrypted Firebase Functions operating behind Google API Gateways, ensuring OAuth keys are never exposed on client browsers.' }
      ],
      perfScore: '99',
      accessScore: '100',
      bestScore: '98',
      seoScore: '100',
      techStackJson: [
        { name: 'React 19', icon: '⚛️', purpose: 'UI component render tree and dynamic view reactivity.', reason: 'Declarative component architecture simplifies multi-panel layouts.', category: 'frontend', docUrl: 'https://react.dev' },
        { name: 'Vite', icon: '⚡', purpose: 'Development hot reloading and rollup build bundler.', reason: 'Provides instant compiler boot and optimized asset splitting trees.', category: 'frontend', docUrl: 'https://vite.dev' },
        { name: 'Firebase', icon: '🔥', purpose: 'Authentication, Firestore db syncing, and Cloud Storage.', reason: 'Offline syncing capabilities reduce client caching code blocks.', category: 'backend', docUrl: 'https://firebase.google.com' }
      ]
    }
  ]
};

async function seed() {
  try {
    console.log('Logging in to Firebase auth...');
    await signInWithEmailAndPassword(auth, 'sahanpramuditha91@gmail.com', 'Sahan@910');
    console.log('Login successful! Seeding projects document...');
    
    await setDoc(doc(db, 'content', 'projects'), projectsSeed);
    console.log('Success! Firebase Firestore successfully seeded with 3 immersive case studies.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  }
  process.exit();
}

seed();
