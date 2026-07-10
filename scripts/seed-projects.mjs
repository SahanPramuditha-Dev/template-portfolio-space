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
    },
    {
      missionCode: 'PRJ002',
      year: 2026,
      title: 'Quantum Ledger',
      slug: 'quantum-ledger',
      shortDescription: 'High-speed real-time cryptographic transaction dashboard and blockchain ledger explorer.',
      valueProposition: 'Visualize cryptographic token streams, settlement charts, and multi-sig wallets with sub-15ms parsing latency.',
      category: 'FinTech',
      status: 'Live',
      client: 'NexusTech Global / Capital Markets',
      industry: 'FinTech / Blockchain Infrastructure',
      teamSize: '3 Engineers',
      projectTimeline: '6 Months (Spring 2026)',
      outcomeBadge: '99.9% Transaction Reliability at 15ms Speed',
      featured: true,
      completed: true,
      projectType: 'client',
      isPrivate: false,
      github: 'https://github.com/SahanPramuditha-Dev/QuantumLedger',
      external: 'https://ledger-demo.vercel.app',
      demoEmail: 'demo@quantumledger.com',
      demoPassword: 'secureledgerpass',
      thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80',
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
          caption: 'Real-time ledger monitor with dynamic transaction feed streams',
          alt: 'Cryptographic transaction grid showcasing blocks and wallet addresses.',
          group: 'Desktop'
        },
        {
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          caption: 'Multi-currency settlement charts and transaction metrics dashboards',
          alt: 'Interactive bar charts tracking transaction volume over time.',
          group: 'Desktop'
        }
      ],
      documents: [
        { name: 'Quantum Ledger Whitepaper PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ],
      description: 'Quantum Ledger bridges the gap between complex cryptographic block states and financial managers. Currently, auditing smart contracts and parsing real-time transaction records requires specialized engineering expertise. This dashboard aggregates block events, calculates settlement fees instantly, and renders security metrics in an accessible interface.',
      role: 'Lead Frontend Architect & Performance Lead',
      problem: 'Auditing multi-chain settlements currently suffers from slow database queries, which latency-locks real-time charts. Financial managers need a zero-delay dashboard to parse contract transactions and verify blockchain balances immediately.',
      solution: 'Built a specialized React UI driven by WebSocket stream handlers. By caching block transactions in a Redis key-value store, Quantum Ledger loads settlement history at sub-15ms speeds, displaying ledger logs cleanly.',
      
      // REDESIGNED CASE STUDY FIELDS
      heroSubtitle: 'Cryptographic ledger monitor built for scale, tracking multi-chain settlement streams.',
      heroStatsJson: [
        { value: '99.9', label: 'Ledger Audit Reliability', suffix: '%' },
        { value: '15', label: 'Settlement Sync latency', suffix: 'ms' },
        { value: '4.2', label: 'Assets Logged', suffix: 'M+' }
      ],
      heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-network-connection-lines-and-dots-background-32285-large.mp4',
      heroImageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80',
      heroThreeJsBg: 'constellation',
      overviewParagraphs: 'Quantum Ledger was built to handle high-frequency blockchain updates without browser locks. Target criteria demanded rendering active block states instantly. Pairing a custom WebSocket ingestion engine with optimized React hooks keeps state calculations isolated, allowing background particle nodes to animate at a stable rate.',
      overviewCardsJson: [
        { icon: 'LineChart', title: 'Live Streaming Feed', description: 'WebSockets push new block transaction objects directly to state grids.' },
        { icon: 'Shield', title: 'Multi-Sig Support', description: 'Visualizes authorization states for shared vault contract keys.' },
        { icon: 'Cpu', title: 'Cryptographic Auditing', description: 'Instantly runs checks on smart contract compiler addresses.' }
      ],
      objectivesJson: [
        { title: 'Zero Render Lag', description: 'Implement state debouncing to keep DOM updates light during block surges.' },
        { title: 'Interactive Graphing', description: 'Draw canvas-based price and settlement trends smoothly.' }
      ],
      beforeAfterJson: [
        { label: 'Legacy Blockchain Explorer', description: 'Query times exceeding 2.5 seconds per block retrieval, stalling dashboard views.', state: 'before', imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=600&q=80' },
        { label: 'Quantum Ledger Dashboard', description: 'Cached Redis pipelines stream blockchain logs instantly, reducing latency to 12ms.', state: 'after', imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80' }
      ],
      storyMilestonesJson: [
        { date: 'Feb 2026', title: 'Pipeline R&D', description: 'Designed custom socket connectors to stream blockchain nodes.', badge: 'Stage 1', status: 'completed' },
        { date: 'Mar 2026', title: 'Contract Integration', description: 'Established secure read hooks to monitor smart contracts.', badge: 'Stage 2', status: 'completed' },
        { date: 'Apr 2026', title: 'Audit & Launch', description: 'Passed independent security reviews and pushed to client servers.', badge: 'Stage 3', status: 'completed' }
      ],
      architectureNodesJson: [
        { id: 'user', label: 'Client Dashboard', desc: 'React interface streaming ledger updates.', icon: 'Monitor', x: 15, y: 50, color: '#38bdf8' },
        { id: 'ingress', label: 'NGINX Ingress', desc: 'Load balancer routing traffic and managing sockets.', icon: 'Cpu', x: 35, y: 50, color: '#10b981' },
        { id: 'cache', label: 'Redis Cache', desc: 'In-memory database caching transaction streams.', icon: 'HardDrive', x: 55, y: 25, color: '#f59e0b' },
        { id: 'ledger', label: 'Node Ledger Engine', desc: 'Core server parsing blocks and formatting history.', icon: 'Server', x: 55, y: 75, color: '#ec4899' },
        { id: 'chain', label: 'Blockchain RPC', desc: 'Main decentralized network node connection.', icon: 'Boxes', x: 80, y: 50, color: '#a855f7' }
      ],
      architectureConnectionsJson: [
        { from: 'user', to: 'ingress', color: '#38bdf8' },
        { from: 'ingress', to: 'cache', color: '#f59e0b' },
        { from: 'ingress', to: 'ledger', color: '#ec4899' },
        { from: 'ledger', to: 'chain', color: '#a855f7' }
      ],
      architectureMarkdown: 'Our system design handles blockchain feeds by segregating heavy query routes from active user traffic. Ingress requests hit NGINX instances. If a transaction query matches cached parameters, Redis serves the response instantly. Uncached request headers propagate down to our Node ledger parsing engine, which queries active RPC nodes directly.',
      folderStructure: `quantum-ledger/
├── contracts/
│   └── MultiSigWallet.sol
├── src/
│   ├── components/
│   │   ├── TransactionFeed.jsx
│   │   └── WalletInspector.jsx
│   ├── hooks/
│   │   ├── useWebsocketStream.js
│   │   └── useRedisCache.js
│   └── main.jsx
├── redis.conf
└── server.js`,
      databaseSchemaJson: [
        { table: 'wallets', description: 'Monitored vault addresses', columns: 'address: string (PK)\nname: string\ncreated_at: timestamp\nbalance: numeric' },
        { table: 'transactions', description: 'Ledger settlement logs', columns: 'tx_hash: string (PK)\nwallet_address: string (FK)\nvalue: numeric\nfee: numeric\nstatus: string' }
      ],
      databaseDesignMarkdown: 'Relational layouts store address mapping profiles. Heavy block histories bypass standard database constraints, storing flat transaction logs directly in indexed read-only collections to maintain settlement speed.',
      apiEndpointsJson: [
        { name: 'Ledger History', endpoint: '/api/v1/tx/history', method: 'GET', description: 'Returns list of past transactions for a wallet address.', requestFormat: '{}', responseFormat: '{\n  "status": "success",\n  "history": [\n    { "tx_hash": "0xabc...", "value": "1.25 ETH" }\n  ]\n}' },
        { name: 'Queue Settlement', endpoint: '/api/v1/settle', method: 'POST', description: 'Initiates a contract wallet transfer.', requestFormat: '{\n  "to": "0xdef...",\n  "amount": "10.0"\n}', responseFormat: '{\n  "status": "queued",\n  "tx_hash": "0x123..."\n}' }
      ],
      authenticationFlow: 'Users register session profiles using JWT. Submitting wallet transfers requires secondary signing keys, which are authenticated using multi-signature smart contract rules directly on the blockchain nodes.',
      engineeringDecisionsJson: [
        { question: 'Should we run polling requests or WebSocket connections for transaction feeds?', decision: 'WebSocket streams', reason: 'WebSockets push block transactions immediately upon creation, eliminating polling overhead and reducing sync delay to < 10ms.', alternatives: 'HTTP short polling', tradeOffs: 'WebSockets require persistent server connections, increasing backend load, but this is offset by the massive reduction in database queries.' }
      ],
      performanceMetricsJson: [
        { label: 'Settlement Latency', value: '12 ms', detail: 'Sub-millisecond query parsing via localized Redis key caching.', status: 'pass' },
        { label: 'CPU Overhead', value: '4%', detail: 'Socket threads run separately from main loop operations.', status: 'pass' },
        { label: 'Code Coverage', value: '98%', detail: 'Jest test suites cover transaction validation scripts.', status: 'pass' }
      ],
      roadmapJson: [
        { task: 'Cross-chain gas optimization models', priority: 'High', status: 'Todo', release: 'Q4 2026' },
        { task: 'Zero-knowledge proof validation endpoints', priority: 'Medium', status: 'In Progress', release: 'Q1 2027' }
      ],
      videosJson: [],
      lessonsLearnedJson: [
        { title: 'Debounce UI State Arrays', description: 'Flooding state arrays with 100+ items per second causes browser page lag. Throttling renders to 200ms intervals fixed performance issues.', icon: 'HelpCircle' }
      ],
      deploymentMarkdown: 'Quantum Ledger builds deploy to client Kubernetes clusters. Custom Github Actions compile frontend build files, package server nodes in Docker containers, and trigger rolling updates on cloud server nodes.',
      ctaJson: {
        title: 'Need secure scale?',
        subtitle: 'Connect your test wallet to explore transaction pipelines, or check out our technical system whitepaper.',
        buttonText: 'LAUNCH PORTAL',
        buttonUrl: 'https://ledger-demo.vercel.app',
        secondaryButtonText: 'READ WHITEPAPER',
        secondaryButtonUrl: 'https://ledger-demo.vercel.app/whitepaper.pdf',
        backgroundImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80'
      },
      relatedProjects: 'studyos,stardust-engine',
      perfScore: '98',
      accessScore: '98',
      bestScore: '100',
      seoScore: '99',
      techStackJson: [
        { name: 'TypeScript', icon: '📘', purpose: 'Strong types validation across transaction models.', reason: 'Ensures strict input shapes during WebGL calculations and API mappings.', category: 'frontend', docUrl: 'https://typescriptlang.org' },
        { name: 'Redis', icon: '🔴', purpose: 'Cache key-value store for block parsing metrics.', reason: 'Serves transaction list queries at sub-millisecond response speeds.', category: 'backend', docUrl: 'https://redis.io' }
      ]
    },
    {
      missionCode: 'PRJ003',
      year: 2026,
      title: 'Stardust Engine',
      slug: 'stardust-engine',
      shortDescription: 'WebGL2-accelerated 3D graphics particle simulation engine and creative design SDK.',
      valueProposition: 'Simulate, orbit, and render millions of particle elements directly in client browsers at a steady 120 FPS.',
      category: 'Creative SDK',
      status: 'Live',
      client: 'Creative Lab / Personal R&D',
      industry: 'Graphics Programming / Creative Coding',
      teamSize: '1 (Sole Developer)',
      projectTimeline: '8 Months (2026)',
      outcomeBadge: 'Render 1.2M Polygons at 120 FPS',
      featured: true,
      completed: true,
      projectType: 'personal',
      isPrivate: false,
      github: 'https://github.com/SahanPramuditha-Dev/StardustEngine',
      external: 'https://stardust-engine.vercel.app',
      demoEmail: '',
      demoPassword: '',
      thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80',
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
          caption: 'Interactive particle editor dashboard displaying gravitational noise fields',
          alt: 'WebGL canvas showing glowing orange star patterns.',
          group: 'Desktop'
        },
        {
          url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
          caption: 'Custom GLSL shader builder with dynamic compilation error terminals',
          alt: 'Code editor side-by-side with compiled particles.',
          group: 'Desktop'
        }
      ],
      documents: [
        { name: 'Stardust Math SDK Guide PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
      ],
      description: 'Stardust Engine targets GPU pipelines directly to resolve coordinate bottlenecks. Standard CPU-bound animations stutter when drawing more than 5,000 components due to render loop lag. This engine compiles custom GLSL shaders to run coordinate transforms directly on user graphics cards, maintaining native fluid frame rates.',
      role: 'Core Graphics Architect & Compiler Engineer',
      problem: 'CPU loop animations stutter when drawing complex particle systems on mobile screens, limiting design aesthetics. Creative developers need a lightweight SDK to render fluid, high-density coordinate simulations.',
      solution: 'Designed a WebGL2 rendering pipeline that offloads physics coordinates to GLSL shaders. Using GPU instancing, Stardust renders up to 1.2 million polygons at 120 FPS on all browser viewports.',
      
      // REDESIGNED CASE STUDY FIELDS
      heroSubtitle: 'GLSL physics simulations targeting GPU shaders for zero-overhead performance.',
      heroStatsJson: [
        { value: '120', label: 'Simulation Frame Rate', suffix: ' FPS' },
        { value: '30', label: 'Runtime Footprint', suffix: ' MB' },
        { value: '1.2', label: 'Active Polygons Rendered', suffix: ' M' }
      ],
      heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-particle-dust-glowing-in-the-dark-44243-large.mp4',
      heroImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80',
      heroThreeJsBg: 'hologram',
      overviewParagraphs: 'Stardust Engine structures matrix algorithms to optimize browser coordinate transformations. By targeting WebGL2 context APIs, the SDK routes simulation updates straight through compiled vertex buffers. The case study details GLSL shaders, vector classes, and GPU instancing setups, providing an interactive playground.',
      overviewCardsJson: [
        { icon: 'Zap', title: 'GPU Instanced Drawing', description: 'Draws millions of particles in a single draw call, eliminating draw overhead.' },
        { icon: 'Boxes', title: 'GLSL Shaders', description: 'Targets GPU vertex shaders directly for custom gravity and noise.' },
        { icon: 'Cpu', title: 'Algebra Core', description: 'Includes custom vector, matrix, and quaternion mathematical operations.' }
      ],
      objectivesJson: [
        { title: 'Maximize FPS Target', description: 'Guarantee 60 FPS minimum on low-power mobile viewports.' },
        { title: 'Minimize Bundle Gzip', description: 'Keep the core SDK under 50KB gzip to ensure immediate loading.' }
      ],
      beforeAfterJson: [
        { label: 'CPU Particle loop', description: 'Laggy coordinates calculated in JavaScript, blocking browser frames at 15 FPS.', state: 'before', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
        { label: 'GPU Shaders Engine', description: 'Instanced draw calls route physics calculations to user graphics cards at 120 FPS.', state: 'after', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80' }
      ],
      storyMilestonesJson: [
        { date: 'Apr 2026', title: 'Algebra Core Build', description: 'Coded linear matrix libraries and quaternion rotations.', badge: 'Step 1', status: 'completed' },
        { date: 'May 2026', title: 'Shader Compilation', description: 'Configured dynamic GLSL hot reloading inside Vite pipelines.', badge: 'Step 2', status: 'completed' },
        { date: 'Jun 2026', title: 'NPM SDK Release', description: 'Released Stardust Engine v1.0.0. Shared templates globally.', badge: 'Step 3', status: 'completed' }
      ],
      architectureNodesJson: [
        { id: 'user', label: 'Web Browser Canvas', desc: 'Viewport display rendering simulated WebGL pixels.', icon: 'Smartphone', x: 15, y: 50, color: '#38bdf8' },
        { id: 'math', label: 'Vector Physics Core', desc: 'Precomputes transform matrices and rotation matrices.', icon: 'Cpu', x: 45, y: 50, color: '#10b981' },
        { id: 'shader', label: 'Custom Shaders', desc: 'GLSL vertex and fragment compilation code blocks.', icon: 'Boxes', x: 75, y: 25, color: '#ec4899' },
        { id: 'gpu', label: 'Device GPU', desc: 'User graphics card rendering compiled geometries.', icon: 'Zap', x: 75, y: 75, color: '#a855f7' }
      ],
      architectureConnectionsJson: [
        { from: 'user', to: 'math', color: '#38bdf8' },
        { from: 'math', to: 'shader', color: '#10b981' },
        { from: 'shader', to: 'gpu', color: '#ec4899' }
      ],
      architectureMarkdown: 'Our SDK architecture isolates coordinate logic. Standard coordinates are calculated in custom WebGL shaders. Developers configure simulation parameters (gravity vectors, noise fields) in JavaScript. The math engine packages these parameters into transformation matrices, which are streamed straight to GPU buffers.',
      folderStructure: `stardust-sdk/
├── src/
│   ├── math/
│   │   ├── Vector3.js
│   │   └── Matrix4.js
│   ├── shaders/
│   │   ├── vertex.glsl
│   │   └── fragment.glsl
│   ├── core/
│   │   ├── Engine.js
│   │   └── Renderer.js
│   └── index.js
└── vite.config.js`,
      databaseSchemaJson: [
        { table: 'shaders', description: 'Precompiled shader collections', columns: 'id: string (PK)\nname: string\nvertex_source: text\nfragment_source: text' },
        { table: 'analytics', description: 'Render performance logs', columns: 'id: string (PK)\nclient_info: string\nfps: integer\ndraw_calls: integer' }
      ],
      databaseDesignMarkdown: 'Local databases store precompiled shader configurations, preventing runtime compiling costs when reloading canvases.',
      apiEndpointsJson: [
        { name: 'Load Shaders', endpoint: '/api/v1/shaders', method: 'GET', description: 'Returns precompiled shader codes.', requestFormat: '{}', responseFormat: '{\n  "status": "success",\n  "shaders": [\n    { "name": "gravity_wave", "vertex": "void main() { ... }" }\n  ]\n}' },
        { name: 'Log Metrics', endpoint: '/api/v1/metrics/report', method: 'POST', description: 'Logs client FPS logs for performance profiling.', requestFormat: '{\n  "fps": 120,\n  "polyCount": 1200000\n}', responseFormat: '{\n  "status": "logged"\n}' }
      ],
      authenticationFlow: 'Since Stardust is an NPM package and creative Coding SDK, it runs entirely client-side without authentication rules. Performance telemetry reports utilize JWT tokens to prevent spam metrics injection.',
      engineeringDecisionsJson: [
        { question: 'Should we calculate coordinates on CPU or offload to GPU?', decision: 'GLSL instanced shaders on GPU', reason: 'Calculating coordinates on the GPU allows drawing millions of objects with a single WebGL draw call, eliminating coordinate latency.', alternatives: 'Canvas2D, Three.js mesh instances', tradeOffs: 'Increases linear algebra complexity on GLSL development, but decreases CPU usage from 90% to near zero.' }
      ],
      performanceMetricsJson: [
        { label: 'Frame Rate', value: '120 FPS', detail: 'Consistent frame rates during high-density simulations on high-refresh screens.', status: 'pass' },
        { label: 'SDK Bundle Size', value: '42 KB', detail: 'Fully tree-shakeable codebase with zero external library dependencies.', status: 'pass' },
        { label: 'Polygon Count', value: '1.2 Million', detail: 'Maximum drawing cap sustained before frame pacing stalls.', status: 'pass' }
      ],
      roadmapJson: [
        { task: 'WebGL GPU Pipeline upgrades', priority: 'High', status: 'Todo', release: 'Q1 2027' },
        { task: 'Simulate soft body physics nodes', priority: 'Medium', status: 'Todo', release: 'Q2 2027' }
      ],
      videosJson: [],
      lessonsLearnedJson: [
        { title: 'Target WebGL2 Contexts', description: 'Legacy WebGL1 browsers lack instanced draw arrays, causing frame rate drops on older devices. Gracefully fallback to lightweight shapes if WebGL2 is missing.', icon: 'BookOpen' }
      ],
      deploymentMarkdown: 'Stardust packages are bundled using rollup. Visual presets and documentation pages deploy automatically to Vercel hosting points upon Git release tag approvals.',
      ctaJson: {
        title: 'Create dynamic worlds',
        subtitle: 'Install our creative coding NPM package, or explore interactive particle templates on codepen.',
        buttonText: 'INSTALL SDK',
        buttonUrl: 'https://stardust-engine.vercel.app',
        secondaryButtonText: 'VIEW CODEPEN',
        secondaryButtonUrl: 'https://stardust-engine.vercel.app/templates',
        backgroundImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80'
      },
      relatedProjects: 'studyos,quantum-ledger',
      perfScore: '100',
      accessScore: '100',
      bestScore: '100',
      seoScore: '100',
      techStackJson: [
        { name: 'WebGL2', icon: '🎨', purpose: 'Renders graphics simulations on user device GPUs.', reason: 'Reduces coordinate loop overhead to near zero levels.', category: 'frontend', docUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext' },
        { name: 'glMatrix', icon: '📐', purpose: 'Vector algebra and matrix transformation math core.', reason: 'Includes lightning-fast optimized compiled matrix arrays.', category: 'frontend', docUrl: 'http://glmatrix.net' }
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
