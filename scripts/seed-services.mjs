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

const servicesSeed = {
  items: [
    {
      title: 'Custom Web Application Development',
      status: 'Published',
      category: 'Web Development',
      icon: 'Code2',
      summary: 'High-performance, secure, and modern web applications tailored specifically to your business goals and workflows.',
      featured: true,
      availability: 'Available now',
      idealFor: 'Startups, SaaS platforms, and digital businesses',
      startingPrice: 'Rs. 150,000',
      timeline: '4–6 weeks',
      turnaround: '48 hr first design draft',
      scope: 'Full stack custom web application build using modern architectures. End-to-end management from requirements analysis to deployment.',
      deliverables: 'React/Vite source code, backend API configuration, deployment setup (Vercel/AWS), documentation, and 30-day support.',
      features: [
        'Responsive UI/UX optimized for mobile & desktop',
        'Authentication & secure role-based access control',
        'State-of-the-art backend database integration',
        'SEO-friendly structure & fast page loading speeds',
        'Interactive analytics dashboard pages'
      ],
      processSteps: [
        { step: 'Discovery', description: 'Aligning on business goals, features, and detailed wireframes.' },
        { step: 'Development', description: 'Incremental sprints with bi-weekly review demos.' },
        { step: 'QA & Handoff', description: 'Rigorous responsive testing, code handoff, and live launch.' }
      ],
      tags: ['React', 'Node.js', 'TailwindCSS', 'Firebase'],
      relatedProject: 'StudyOS',
      cta: "Let's build your app",
      link: '/#contact'
    },
    {
      title: 'Premium E-Commerce Development',
      status: 'Published',
      category: 'Web Development',
      icon: 'Globe',
      summary: 'Fast, secure, and conversion-optimized online stores designed to showcase your products beautifully and drive sales.',
      featured: true,
      availability: 'Available now',
      idealFor: 'Retail brands, digital creators, and boutique shops',
      startingPrice: 'Rs. 95,000',
      timeline: '3–4 weeks',
      turnaround: '3 days initial layout',
      scope: 'Responsive online store setup featuring modern product navigation, secure payments, and a powerful admin backend dashboard.',
      deliverables: 'Fully operational e-commerce site, inventory manager backend, localized payment integration, and user training manual.',
      features: [
        'Dynamic product filters & category search',
        'Shopping cart & optimized checkout funnel',
        'Secure checkout with stripe / local card gateways',
        'Admin inventory, order, and customer dashboard',
        'Automated invoice & email notification templates'
      ],
      processSteps: [
        { step: 'Planning', description: 'Structuring inventory catalogs, shipping rules, and payment gateways.' },
        { step: 'Design & Build', description: 'Creating visually stunning storefront UI and integrating backend.' },
        { step: 'Training', description: 'Testing checkout flows and client training on product management.' }
      ],
      tags: ['Next.js', 'Stripe', 'TailwindCSS', 'Payload CMS'],
      cta: 'Launch your store',
      link: '/#contact'
    },
    {
      title: 'RESTful API & Backend Engineering',
      status: 'Published',
      category: 'API & Backend',
      icon: 'Server',
      summary: 'Robust, highly scalable, and secure backend systems, database schemas, and REST/GraphQL APIs built to fuel your mobile or web frontends.',
      featured: true,
      availability: 'Limited availability',
      idealFor: 'Mobile app developers and tech teams needing backend scale',
      startingPrice: 'Rs. 120,000',
      timeline: '3–5 weeks',
      turnaround: '24 hr architecture draft',
      scope: 'Designing database architectures, implementing core business logic, third-party integrations, and establishing REST/GraphQL endpoints.',
      deliverables: 'Node.js backend source code, OpenAPI/Swagger API documentation, automated test suite, and cloud hosting deployment script.',
      features: [
        'Fast response times with redis caching layers',
        'Robust SQL/NoSQL schema migrations & indexing',
        'Secure JWT / OAuth2 authorization strategies',
        'Comprehensive endpoint API unit testing suites',
        'Third-party system integrations (Stripe, Twilio, SendGrid)'
      ],
      processSteps: [
        { step: 'API Schema', description: 'Establishing Swagger docs, endpoint specifications, and DB ERDs.' },
        { step: 'Core Coding', description: 'Building route controllers, middleware, and business logic pipelines.' },
        { step: 'Ops & Deploy', description: 'Setting up automated Docker containers and deployment to cloud platforms.' }
      ],
      tags: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
      cta: 'Discuss API scope',
      link: '/#contact'
    },
    {
      title: 'Premium Portfolio & Personal Branding Website',
      status: 'Published',
      category: 'Web Development',
      icon: 'Globe',
      summary: 'Stunning, high-end interactive portfolio websites built with creative animations, fast loading speeds, and CMS integration to showcase your work and attract high-paying clients.',
      featured: true,
      availability: 'Available now',
      idealFor: 'Designers, developers, executives, and agency founders',
      startingPrice: 'Rs. 60,000',
      timeline: '2–3 weeks',
      turnaround: '48 hr design mockup',
      scope: 'Developing an interactive personal brand space with modern responsive layout, smooth motion effects, custom contact integrations, and a fully manageable CMS panel.',
      deliverables: 'React/Vite source code, content management guide, SEO optimization setup, domain hosting connection, and 15-day launch support.',
      features: [
        'Premium immersive design with custom glassmorphism/blur theme',
        'Headless CMS panel to edit projects, services, and blog posts',
        'Fully responsive layouts optimized for all screens & viewports',
        'SEO-optimized meta tags, titles, and structural JSON-LD data',
        'Fluid animations & interactive UI elements'
      ],
      processSteps: [
        { step: 'Brand Identity', description: 'Reviewing color schemes, typography, layout structures, and resumes.' },
        { step: 'Interactive Dev', description: 'Building the UI components, smooth motion animations, and CMS connectors.' },
        { step: 'Launch & SEO', description: 'Deployment, mapping domains, configuring search consoles, and SEO optimizations.' }
      ],
      tags: ['React', 'Framer Motion', 'TailwindCSS', 'Firebase'],
      cta: 'Build my portfolio',
      link: '/#contact'
    }
  ]
};

async function seed() {
  try {
    console.log('Logging into database...');
    await signInWithEmailAndPassword(auth, 'sahanpramuditha91@gmail.com', 'Sahan@910');
    console.log('Login successful! Seeding services document...');
    await setDoc(doc(db, 'content', 'services'), servicesSeed);
    console.log('Database successfully seeded with realistic services data!');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  }
  process.exit();
}

seed();
