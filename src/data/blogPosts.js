/**
 * Comprehensive Fallback & Seed Data for Blog Posts
 * Written with deep technical substance, varied structure, and project context.
 */

export const BLOG_POSTS = [
  {
    id: 'post-1',
    title: 'I Built a POS System Before I Fully Understood What a POS System Was',
    slug: 'i-built-a-pos-system-before-i-understood-pos',
    category: 'Software Engineering',
    tags: 'Architecture, Databases, ERP, Case Study, Refactoring',
    author: 'Sahan Pramuditha',
    date: '2026-07-15',
    readTime: '8 min read',
    featured: true,
    status: 'Published',
    excerpt: 'When I set out to build I-Store ERP, I thought a Point of Sale system was just a fancy shopping cart with a database. Five thousand lines of code later, I learned the hard way about concurrency, cash drawer reconciliation, tax rounding, and offline transaction queues.',
    body: `### The Naive Beginner Assumption

Like many self-taught builders, when I first drafted the requirements for **I-Store ERP**, my mental model of a Point of Sale (POS) application was laughably simple:

1. User scans barcode or selects item.
2. App adds item to an array state in React or C#.
3. App calculates sum: \`total = price * quantity\`.
4. User clicks "Pay", database decrements stock counter by \`quantity\`.
5. Print receipt. Done.

I spent a weekend building a prototype that did exactly this. It looked slick, rendered product grids with fast response times, and felt like a complete victory. 

Then I demoed it to a friend who worked in retail store management. Within two minutes of testing, he asked three questions that shattered my naive architecture:
- *"What happens if two cashiers check out the last unit of an item at the exact same millisecond?"*
- *"How does this handle a power outage mid-transaction after the payment terminal captures money but before the stock updates?"*
- *"Where is the shift reconciliation ledger for tax authority audits?"*

I realized I hadn't built a Point of Sale system. I had built a toy checkout button. Real retail engineering is not about computing totals; it is about **state consistency, transactional integrity, hardware peripheral sync, and accounting precision under chaotic conditions**.

---

## Architecture Nightmare #1: Race Conditions & Stock Atomicity

In my initial schema, checking out an item ran a simple update query:

\`\`\`sql
-- Naive update query
UPDATE products 
SET stock = stock - 1 
WHERE id = 'PROD-4092';
\`\`\`

If \`stock\` was 1, and two simultaneous API requests hit this endpoint concurrently, both read \`stock = 1\`, both passed the check \`stock > 0\`, and both executed the subtraction. The database ended up with \`stock = -1\`, selling an inventory item that physically did not exist.

To solve this, I had to learn about **ACID transactions, pessimistic locking vs. optimistic concurrency control, and atomic conditional updates**:

\`\`\`sql
-- Atomic update with stock validation constraint
UPDATE products 
SET stock = stock - @quantity,
    updated_at = NOW()
WHERE id = @product_id 
  AND stock >= @quantity;
\`\`\`

If the query affected 0 rows, the transaction failed instantly, signaling to the application layer that an inventory collision occurred, allowing the UI to offer immediate alternative actions to the cashier.

---

## Architecture Nightmare #2: Floating-Point Math vs. Financial Precision

Early in development, I made the classic mistake of using standard JavaScript \`Number\` double-precision floats for pricing calculation:

\`\`\`js
// Dangerously imprecise financial calculation
const subtotal = 19.99 * 3; // 59.970000000000006
const tax = subtotal * 0.15; // 8.995500000000001
const total = subtotal + tax; // 68.96550000000001
\`\`\`

When summing hundreds of item items across a full business day, floating-point rounding errors accumulated into actual currency discrepancy cents. In accounting and tax compliance, missing or added cents between the itemized receipts and ledger totals trigger audit red flags.

I refactored the entire monetary pipeline to store **all financial amounts as integer cents (or micro-units)** in the database, wrapping operations in fixed-precision decimal arithmetic helpers:

\`\`\`js
// Financial calculations using integer micro-units
const centsPrice = 1999; // $19.99 stored as cents
const quantity = 3;
const subtotalCents = centsPrice * quantity; // 5997 cents ($59.97)
const taxRateBps = 1500; // 15.00% tax represented as basis points (1/100th of 1%)

const taxCents = Math.round((subtotalCents * taxRateBps) / 10000); // 900 cents ($9.00)
const totalCents = subtotalCents + taxCents; // 6897 cents ($68.97)
\`\`\`

---

## Hardware Interfacing: Receipt Printers, Barcode Scanners, and USB Serial Devices

Software engineers take browser DOM events for granted until they have to interface with ESC/POS thermal receipt printers over USB or raw Serial ports.

Barcode scanners function as rapid HID virtual keyboards, firing \`keydown\` events at 20–50 characters per second followed by a carriage return (\`Enter\`). If an input field is focused on screen, scanning a barcode drops raw characters into text boxes. If no field is focused, the keystrokes vanish into the ether.

I built a global scanner event bus listener that monitors inter-keystroke timing intervals:

\`\`\`js
let buffer = '';
let lastKeyTime = Date.now();

window.addEventListener('keydown', (e) => {
  const currentTime = Date.now();
  const timeDiff = currentTime - lastKeyTime;
  lastKeyTime = currentTime;

  // Barcode scanners type with < 25ms delay between characters
  if (timeDiff < 25) {
    if (e.key === 'Enter') {
      if (buffer.length > 3) {
        handleBarcodeScan(buffer);
      }
      buffer = '';
    } else if (e.key.length === 1) {
      buffer += e.key;
    }
  } else {
    // Reset buffer if human typing speed detected (> 50ms)
    buffer = e.key.length === 1 ? e.key : '';
  }
});
\`\`\`

---

## Key Takeaways From Building I-Store ERP

Building a retail software platform forced me to outgrow the mindset of writing code that merely works on the happy path. 

1. **Failure mode planning comes first**: What happens when the receipt printer runs out of paper mid-print? What happens when the network drops during payment gateway confirmation?
2. **Audit trails are non-negotiable**: Every price change, refund, voids, and shift opening cash float must produce an immutable audit log entry tied to an authenticated cashier ID.
3. **Domain knowledge trumps slick syntax**: You cannot engineer software for an industry until you understand how the people inside that industry actually work under pressure.

Today, when I work on projects like [StudyOS](/projects/studyos) or high-throughput data platforms, the lessons learned from wrestling with inventory race conditions and raw serial buffers continue to inform my system design choices.`,
    codeSnippet: `// Fixed precision money handling helper
export class Money {
  constructor(cents) {
    this.cents = Math.round(cents);
  }
  static fromDecimal(val) {
    return new Money(Math.round(val * 100));
  }
  add(other) { return new Money(this.cents + other.cents); }
  multiply(factor) { return new Money(Math.round(this.cents * factor)); }
  toFormat() { return (this.cents / 100).toFixed(2); }
}`,
    language: 'javascript',
    link: '/projects/istore'
  },
  {
    id: 'post-2',
    title: 'The Difference Between Making Software and Engineering Software',
    slug: 'making-software-vs-engineering-software',
    category: 'Software Engineering',
    tags: 'Architecture, Maintainability, Testing, Clean Code, Systems',
    author: 'Sahan Pramuditha',
    date: '2026-07-02',
    readTime: '7 min read',
    featured: false,
    status: 'Published',
    excerpt: 'Anyone can hack together a React component or express route that functions when inputs are perfect. Software engineering begins when you design for edge cases, network partitioning, memory bounds, and developer maintainability.',
    body: `### The Craft Beyond "It Works on My Machine"

Early in computer science studies, success is measured by a binary outcome: *Does the program execute without throwing an error and produce the desired output?*

If the assignment prompt asks for a sorting algorithm or a CRUD app, and your code passes the unit test cases provided by the professor, you get an A. You have *made* software.

However, once you start building systems intended for real users—whether it is a student operating system like [StudyOS](/projects/studyos) or a real-time blockchain monitoring ledger like [Quantum Ledger](/projects/quantum-ledger)—you quickly discover that functional correctness is only 20% of the challenge.

The remaining 80% is the domain of **Software Engineering**: designing systems that remain correct, maintainable, performant, and resilient under continuous stress, changing requirements, and unexpected failures.

---

## 1. Feature Creation vs. Failure Mitigation

A software *maker* focuses on the happy path:
- "When the user clicks submit, send POST request to \`/api/data\` and update UI state."

A software *engineer* spends 80% of their thought process on the failure paths:
- What if the network drops while the byte stream is half-transmitted?
- What if the API returns a 503 Service Unavailable or a malformed payload?
- What if the payload takes 8 seconds due to server load? Does the UI freeze or show a graceful degraded loader?
- Is the request idempotent? Will double-clicking the button create duplicate records?

\`\`\`tsx
// Engineering approach: Exponential backoff + AbortController + Idempotency Key
async function submitDataWithResilience(payload, attempt = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': payload.idempotencyKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(\`Server returned status \${response.status}\`);
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (attempt < 3 && err.name !== 'AbortError') {
      const delay = Math.pow(2, attempt) * 500; // Exponential backoff: 1s, 2s, 4s
      await new Promise(res => setTimeout(res, delay));
      return submitDataWithResilience(payload, attempt + 1);
    }
    throw err;
  }
}
\`\`\`

---

## 2. Clever Code vs. Readable Architecture

Beginner developers often take pride in writing dense, one-liner abstractions that look like cryptographic puzzles:

\`\`\`javascript
// "Clever" one-liner that is difficult to debug or maintain
const process = d => d.filter(x=>x.a).map(x=>({...x,v:x.v*1.15})).reduce((a,b)=>a+b.v,0);
\`\`\`

An engineer prioritizes clarity, explicit naming, domain intent, and self-documenting structures. Code is read ten times more often than it is written.

\`\`\`typescript
interface ActiveOrder {
  isActive: boolean;
  itemValueCents: number;
}

/** Computes the total bill value with tax for all active customer orders. */
export function calculateActiveOrdersTotal(orders: ActiveOrder[], taxMultiplier = 1.15): number {
  return orders
    .filter(order => order.isActive)
    .map(order => order.itemValueCents * taxMultiplier)
    .reduce((runningTotal, currentOrderTotal) => runningTotal + currentOrderTotal, 0);
}
\`\`\`

---

## 3. Coupling vs. Modular Boundaries

Making software often results in monolithic spaghetti code: components directly modifying DOM nodes, API calls embedded inside UI presentation logic, and global variables shared across files.

Engineering software requires **Separation of Concerns and Inversion of Control**. High-level business rules should never depend on low-level UI details or database drivers.

When building [StudyOS](/projects/studyos), I explicitly decoupled the UI layer from the sync storage layer through clean repository interfaces. Whether the backend persists data to IndexedDB, LocalStorage, or Firebase Firestore, the core UI components do not care—they consume clean, reactive hooks.

---

## The Engineering Checklist

When reviewing code before pushing to production, I ask myself these questions:

1. **Observability**: If this breaks in production at 3 AM, will log entries provide sufficient context to identify the root cause without reproducing it locally?
2. **Type Safety**: Are data shapes validated at system boundaries (e.g. Zod validation schemas on incoming API responses)?
3. **Resource Lifecycle**: Are event listeners, WebSockets, and timers properly unsubscribed when components unmount to prevent memory leaks?
4. **Security**: Are input strings sanitized against XSS, and are database queries parameterized against injection?

Software engineering is not about knowing every framework or syntax feature. It is about taking responsibility for the full lifecycle, safety, and longevity of the systems you create.`,
    codeSnippet: `// Zod boundary schema validation pattern
import { z } from 'zod';

const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'student', 'guest']),
  preferences: z.object({ theme: z.string().default('dark') })
});

export function parseIncomingUser(rawJson: unknown) {
  const result = UserProfileSchema.safeParse(rawJson);
  if (!result.success) {
    console.error('Invalid payload schema boundary error:', result.error);
    return null;
  }
  return result.data;
}`,
    language: 'typescript',
    link: '/blog/strange-engineering-problems-not-in-tutorials'
  },
  {
    id: 'post-3',
    title: 'The Strange Engineering Problems Nobody Mentions in Tutorials',
    slug: 'strange-engineering-problems-not-in-tutorials',
    category: 'Software Engineering',
    tags: 'DevOps, Environment, Debugging, Real-World, Operating Systems',
    author: 'Sahan Pramuditha',
    date: '2026-06-18',
    readTime: '9 min read',
    featured: false,
    status: 'Published',
    excerpt: 'Tutorials show clean code running in pristine environments. They never warn you about file descriptor locks, CORS preflight pre-bundling bugs, cross-platform path separators, or silent environment variable truncation in CI pipelines.',
    body: `### The Gap Between YouTube Demos and Reality

Online video tutorials are designed to be smooth, linear, and reassuring. The instructor types code into a pristine code editor, runs a command, green text appears in the terminal, and the app launches flawlessly.

When you start building independent projects outside tutorial sandboxes, you enter a realm of bizarre, unglamorous problems that never make it into video scripts.

Over the past three years of building web apps, native utilities, and 3D graphics engines, here are five strange engineering problems I ran into—and how to solve them.

---

## 1. The Cross-Platform Path Separator Trap (\`\\\` vs. \`/\`)

If you develop on Windows and deploy to a Linux container (such as Vercel, Firebase Hosting, or AWS EC2), path handling is a classic trap:

\`\`\`javascript
// Windows path (Works locally on Windows, crashes on Linux server)
const imagePath = \`src\\\\assets\\\\images\\\\\${fileName}\`;

// Linux path (Fails on local Windows dev environment)
const imagePath = \`src/assets/images/\${fileName}\`;
\`\`\`

If you hardcode backslashes or concatenate string paths manually, your local Windows build will succeed, but your Linux deployment step will throw \`ENOENT: no such file or directory\`.

**The Solution**: Always use Node's native \`path\` module or URL objects:

\`\`\`javascript
import path from 'node:path';

// Automatically resolves file path separators based on OS platform
const imagePath = path.join(process.cwd(), 'src', 'assets', 'images', fileName);
\`\`\`

---

## 2. Silent Environment Variable Truncation in CI/CD Systems

While configuring GitHub Actions CI for my portfolio deployments, I spent four hours debugging why Firebase authentication was throwing \`auth/invalid-api-key\`.

Locally, the \`.env\` file looked like this:
\`\`\`env
VITE_FIREBASE_API_KEY="AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y"
\`\`\`

In GitHub Repository Secrets, someone had pasted the key surrounded by trailing quotes or inline newline breaks (\`\\n\`). When the build runner injected the secret into Vite, the quotation marks were bundled literally inside the build string, resulting in:
\`"AIzaSyD2jARZLL75tRWQ5_gOZ71nLkQXF7tek3Y""\`

**The Solution**: Always sanitize and validate environment variables at Vite/Webpack build startup:

\`\`\`javascript
// vite.config.js - Build-time env sanitizer plugin
export function envSanitizerPlugin() {
  return {
    name: 'env-sanitizer',
    configResolved(config) {
      const apiKey = config.env.VITE_FIREBASE_API_KEY;
      if (apiKey && (apiKey.startsWith('"') || apiKey.endsWith('\n'))) {
        throw new Error('[FATAL]: VITE_FIREBASE_API_KEY contains invalid quotes or newlines!');
      }
    }
  };
}
\`\`\`

---

## 3. SQLite Database File Locking under Concurrency

During early testing of a local desktop tool, I selected SQLite for lightweight data storage. In a single-threaded local test, SQLite executed at blazing speeds.

However, when I added background worker processes to sync notes concurrently while the UI thread was writing user logs, the application threw:
\`SqliteError: database is locked\`

Because SQLite uses file-level locking for write operations, multiple processes attempting to write simultaneously block each other.

**The Solution**: Enable **Write-Ahead Logging (WAL)** mode during connection initialization:

\`\`\`sql
-- Executes WAL mode for concurrent reader/writer access
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
\`\`\`

WAL mode allows multiple reader processes to execute queries while a write operation is being appended to the log file.

---

## 4. Browser Memory Accumulation from Uncleared Interval Timers

While developing custom particle visualizers for the background of this portfolio, I noticed browser RAM usage steadily climbing from 120MB up to 1.8GB over a 20-minute period.

The root cause was simple: a React component contained a \`setInterval\` updating canvas animation telemetry. When navigating between pages in Single Page Application (SPA) routing, the component unmounted, but the interval timer was never cleared:

\`\`\`jsx
// Bug: Memory leak on unmount
useEffect(() => {
  const timer = setInterval(() => {
    updateTelemetry();
  }, 100);
  // Missing return () => clearInterval(timer); !!
}, []);
\`\`\`

Every page navigation spawned a new hidden background timer loop, keeping references to old DOM nodes and closures in heap memory.

---

## Lessons Learned

Real-world engineering competence is not measured by how fast you can type boilerplate syntax from memory. It is built by encountering weird bugs, reading stack traces calmly, understanding system abstractions beneath your code, and writing defensive checks so the same bug never strikes twice.`,
    codeSnippet: `// Cross-platform safe path normalization utility
import path from 'path';

export function normalizeAssetPath(relativePath) {
  return relativePath
    .split(/[\\\\/]/) // Split by either backslash or forward slash
    .filter(Boolean)
    .join(path.sep);
}`,
    language: 'javascript',
    link: '/blog/making-software-vs-engineering-software'
  },
  {
    id: 'post-4',
    title: 'I Started Building With AI — Then Realized I Had to Learn More, Not Less',
    slug: 'building-with-ai-learn-more-not-less',
    category: 'AI',
    tags: 'AI, LLMs, Developer Tools, Productivity, Learning',
    author: 'Sahan Pramuditha',
    date: '2026-06-04',
    readTime: '8 min read',
    featured: true,
    status: 'Published',
    excerpt: 'AI coding assistants can generate 50 lines of code in 2 seconds. But if you do not understand memory management, state updates, or network security, you are just accelerating technical debt.',
    body: `### The Initial Illusion of Unlimited Velocity

When I first integrated AI coding assistants into my IDE workflow, it felt like gaining a superpower. 

Need a complex CSS flexbox layout? Ask the model. Need a regex pattern to extract email addresses? Prompt it. Need a boilerplate express middleware route? Press Tab, and watch lines of code auto-complete across the screen.

For the first few weeks, my output velocity surged. I was completing features in hours that previously took days.

Then the honeymoon ended. 

I hit a complex state synchronization bug in a React 19 application. The AI suggested a quick fix. I accepted it. That fix broke another component. I prompted the AI to fix *that* error. It suggested wrapping everything in a \`useEffect\` with missing dependencies. Soon, the file was 800 lines of convoluted, circular logic that nobody understood—least of all the AI model generating it.

That was the moment I realized a fundamental truth: **AI tools do not diminish the need for deep engineering knowledge. They drastically increase it.**

---

## The Illusion of Syntactic Correctness

Large Language Models (LLMs) are statistical pattern matchers. They produce text that *looks like* code based on training probabilities. They do not possess a mental model of your application runtime, thread stack, or data constraints.

Consider this example where an AI generated code to debounce a search bar input in React:

\`\`\`jsx
// AI Generated Code (Flawed!)
function SearchComponent() {
  const [query, setQuery] = useState('');

  const debouncedSearch = (text) => {
    setTimeout(() => {
      fetchSearchResults(text);
    }, 300);
  };

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
\`\`\`

To an inexperienced developer, this code looks clean and plausible. But any experienced front-end engineer will spot the flaws immediately:
1. It creates a brand-new \`setTimeout\` timer on *every single keystroke* without clearing the previous one, firing multiple redundant API requests after 300ms.
2. It lacks unmount cleanup, creating memory leaks if the user navigates away.

Because the code compiled without TypeScript errors, a beginner relying entirely on AI would push it directly to production.

---

## Why Fundamentals Matter More Than Ever

When code generation becomes instant and cheap, the bottleneck in software engineering shifts from **writing code** to **evaluating and auditing code**.

To evaluate AI-generated output effectively, you need a deep understanding of:

### 1. Data Structures and Complexity ($O(n)$ vs $O(n^2)$)
An AI model will happily write nested array loops inside a React component rendering 10,000 items. If you do not recognize algorithmic time complexity, your app will freeze on mobile devices.

### 2. Architectural Boundaries
AI models tend to suggest quick, local fixes that violate system layering—such as writing raw SQL or API calls directly inside UI render functions. An engineer must enforce clean architecture boundaries.

### 3. Security Hardening
AI models routinely generate code with security vulnerabilities: unparameterized database queries, permissive CORS headers (\`*\`), and missing token validation. You must be able to audit code for security flaws before deployment.

---

## My Current AI Workflow Strategy

Today, I use AI tools extensively—including local open-source models like Ollama for offline experimentation—but under strict rules:

1. **Never accept code I cannot explain**: If an AI suggests a solution I do not understand line-by-line, I pause, read the documentation, and dissect the logic before accepting it.
2. **Use AI for repetitive boilerplate, not system architecture**: AI excels at generating initial TypeScript interfaces, unit test stubs, and regex patterns. Architecture decisions remain strictly human.
3. **Verify edge cases manually**: I test error boundaries, network drops, and invalid payload handling manually rather than assuming the generated code handles them.

AI is an extraordinary multiplier for software engineers. But a multiplier on zero knowledge is still zero. The developers who thrive in the AI era will not be those who rely on prompt templates—they will be those who master the underlying computer science fundamentals.`,
    codeSnippet: `// Correct React debounce pattern using useCallback & useRef
import { useRef, useCallback, useEffect } from 'react';

export function useDebouncedCallback(callback, delayMs) {
  const timerRef = useRef(null);

  const debouncedFn = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callback(...args);
    }, delayMs);
  }, [callback, delayMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debouncedFn;
}`,
    language: 'typescript',
    link: '/blog/what-developers-should-use-ai-for'
  },
  {
    id: 'post-5',
    title: 'What Should Developers Actually Use AI For?',
    slug: 'what-developers-should-use-ai-for',
    category: 'AI',
    tags: 'AI, Pragmatism, Developer Workflow, Security, Code Quality',
    author: 'Sahan Pramuditha',
    date: '2026-05-22',
    readTime: '7 min read',
    featured: false,
    status: 'Published',
    excerpt: 'AI tools are neither magical silver bullets nor useless hype. Here is a realistic taxonomy of where AI delivers real value, where it creates security risks, and where human judgment must remain in command.',
    body: `### Navigating the Hype vs. Disillusionment Spectrum

Discussion around AI in software development tends to split into two extreme camps:
- **The Technocrats**: Claiming programmers will be obsolete within two years and all software will be generated from natural language prompts.
- **The Skeptics**: Dismissing AI as glorified autocomplete that produces insecure, low-quality code.

Having built projects using both cloud LLM APIs and local model setups, I find the reality lies firmly in the middle. AI is a tool—like an IDE, a debugger, or a compiler. 

To get actual value from AI without creating technical debt, developers need a **clear taxonomy of when to leverage AI and when to turn it off**.

---

## 🟢 High Value: Where AI Excels

### 1. Generating Mock Data and Unit Test Suites
Writing 20 variations of JSON test objects or edge-case unit tests for a string parser is tedious. AI is exceptionally good at expanding test coverage:

\`\`\`typescript
// Prompt: "Generate Jest unit tests covering edge cases for this email validator"
describe('emailValidator', () => {
  it('should reject emails with double dots in domain', () => {
    expect(isValidEmail('user@domain..com')).toBe(false);
  });
  it('should accept valid subdomains', () => {
    expect(isValidEmail('user@sub.domain.co.uk')).toBe(true);
  });
});
\`\`\`

### 2. Translating Between Data Formats
Converting a complex SQL schema into TypeScript interfaces or Zod schemas is mechanical work where AI saves hours of typing.

### 3. Exploratory Syntax and API Lookups
Instead of searching through documentation pages to remember how to format a CSS grid area or configure a Docker multi-stage build, an AI prompt provides immediate syntax templates.

---

## 🟡 Caution Required: Where Human Review Is Essential

### 1. Refactoring Core Business Logic
If you ask an AI to "clean up" a complex algorithm, it may inadvertently alter subtle edge-case behaviors, strip out necessary lock releases, or remove defensive null checks. Always review git diffs carefully.

### 2. Performance Optimization
AI models often suggest generic optimizations (like memoizing every React component) that add memory overhead without improving frame rates. Benchmark performance before and after accepting suggestions.

---

## 🔴 High Risk: Where AI Should Not Be Trusted Unchecked

### 1. Cryptography and Security Authentication
Never allow an AI to generate custom cryptographic hash functions, JWT validation logic, or permissions middleware without thorough manual security audits. Models frequently suggest outdated algorithms (like MD5) or omit token expiration checks.

### 2. Complex System Architecture & Database Design
An AI cannot weigh the real-world trade-offs of choosing PostgreSQL vs. DynamoDB for your specific traffic patterns, cost budget, and team expertise. Strategic architecture decisions require deep human context.

---

## The Pragmatic Rule of Thumb

| Task Category | AI Usage Strategy | Human Role |
| :--- | :--- | :--- |
| **Boilerplate & Tests** | **Delegate 80%** | Review for correctness |
| **Documentation & Explanations** | **Delegate 70%** | Verify technical accuracy |
| **Feature Implementation** | **Collaborate 50/50** | Drive architecture & review diffs |
| **Security & Auth Rules** | **Delegate 0%** | Primary owner & security auditor |

By treating AI as an intelligent junior assistant rather than an autonomous engineer, you can accelerate your workflow while keeping your codebase clean, secure, and maintainable.`,
    codeSnippet: `// Example: Using Zod for input schema sanitization
import { z } from 'zod';

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});`,
    language: 'typescript',
    link: '/blog/could-ai-become-my-personal-study-assistant'
  },
  {
    id: 'post-6',
    title: 'Could an AI Actually Become My Personal Study Assistant?',
    slug: 'could-ai-become-my-personal-study-assistant',
    category: 'AI',
    tags: 'StudyOS, AI, Productivity, Local AI, RAG',
    author: 'Sahan Pramuditha',
    date: '2026-05-10',
    readTime: '9 min read',
    featured: false,
    status: 'Published',
    excerpt: 'While building StudyOS, I experimented with embedding local AI models to query course lecture notes, organize task deadlines, and generate active recall flashcards offline.',
    body: `### The Student Productivity Paradox

As a software engineering student at university, I spent half my time managing context switching rather than actually studying:
- Lecture slides lived in PDF folders.
- Code repositories lived on GitHub.
- Homework deadlines lived in calendar apps.
- Rough revision notes were scattered across markdown files.

When I started building [StudyOS](/projects/studyos)—an integrated digital workspace for student developers—I asked a core question: **Can we integrate AI into a student workspace without relying on expensive cloud API subscriptions or exposing private notes to third-party servers?**

---

## Experimenting with Local Context (RAG)

Generic commercial AI chat tools are useful, but they lack context about your specific university syllabus, course module codes, and assignment instructions.

To solve this in StudyOS, I experimented with **Retrieval-Augmented Generation (RAG)** running locally in the browser and desktop environment:

\`\`\`
[ Student Notes / Markdown ] 
       │
       ▼ (Vector Embeddings)
[ Local Vector Store (IndexedDB) ] ─────► [ Semantic Search Query ]
                                                  │
                                                  ▼
                                       [ Local LLM (Ollama / WebLLM) ]
                                                  │
                                                  ▼
                                      [ Contextual Answer / Flashcard ]
\`\`\`

1. **Chunking**: Markdown notes are split into 300-word logical chunks.
2. **Embedding**: Text chunks are converted into 384-dimensional vector embeddings using a lightweight local transformer model.
3. **Retrieval**: When the student asks *"What are the key differences between TCP and UDP according to my Lecture 4 notes?"*, the vector store retrieves the top 3 relevant note sections.
4. **Generation**: The local model generates a concise summary based *strictly* on the retrieved lecture notes.

---

## Key Features Built for Student Workflows

### 1. Automated Active Recall Flashcard Generation
Instead of manually typing flashcards, StudyOS parses lecture note headers and generates flashcard pairs:

\`\`\`json
{
  "front": "What is the primary function of the TLS 1.3 Handshake?",
  "back": "To establish authenticated, encrypted communication keys in a single round-trip time (1-RTT).",
  "sourceNote": "Networking_Lecture_05.md"
}
\`\`\`

### 2. Context-Aware Deadline Prioritization
By indexing assignment submission criteria and exam dates, the assistant highlights urgent tasks based on estimated workload rather than just chronological order.

---

## Technical Challenges & Privacy Constraints

Building an AI study assistant surfaced two major challenges:

1. **Hallucination Mitigation**: If an AI study assistant invents incorrect formulas or definitions right before an exam, it does more harm than good. Grounding the LLM strictly in retrieved note chunks with explicit citations was mandatory.
2. **Resource Usage**: Running LLM inference locally consumes significant memory and CPU/GPU cycles. We implemented lazy loading so the AI engine only initializes when the student opens the assistant pane, keeping default note editing light and instant.

Explore the complete architecture on the [StudyOS Case Study Page](/projects/studyos).`,
    codeSnippet: `// Vector similarity calculation helper (Cosine Similarity)
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}`,
    language: 'javascript',
    link: '/projects/studyos'
  },
  {
    id: 'post-7',
    title: 'What Actually Happens When You Open a Website?',
    slug: 'what-happens-when-you-open-a-website',
    category: 'Networking',
    tags: 'Networking, Protocols, DNS, HTTP, Web Architecture',
    author: 'Sahan Pramuditha',
    date: '2026-04-28',
    readTime: '10 min read',
    featured: true,
    status: 'Published',
    excerpt: 'You type a URL into your browser bar and press Enter. In under 300 milliseconds, a sequence of DNS lookups, TCP handshakes, TLS key exchanges, and DOM rendering pipelines execute across global network infrastructure.',
    body: `### The Invisible 300-Millisecond Journey

To a non-technical user, opening a website feels instantaneous. You type \`sahanpramuditha.me\` into the address bar, press Enter, and the webpage materializes on screen.

To a software engineer, that single keypress triggers one of the most complex distributed systems interactions ever created. Understanding this lifecycle is what separates engineers who treat the web as magic from those who can optimize network bottlenecks and debug production latency.

Here is the step-by-step breakdown of what occurs behind the scenes.

---

## Step 1: URL Parsing and HSTS Check

Before transmitting a single packet onto the physical network wire, the browser parses the input URL string:

\`\`\`
Scheme: https://
Hostname: sahanpramuditha.me
Port: 443 (Default for HTTPS)
Path: /blog
\`\`\`

The browser checks its local **HSTS (HTTP Strict Transport Security)** pre-loaded cache to verify if the domain requires forced HTTPS encryption. If yes, it upgrades any \`http://\` request to \`https://\` immediately without sending unencrypted network packets.

---

## Step 2: DNS Resolution (Domain Name System)

Computer networks route packets using IP addresses (\`151.101.1.195\`), not human-readable domain names. The browser initiates a multi-stage DNS lookup sequence:

1. **Browser Cache**: Checks if the IP address for \`sahanpramuditha.me\` is stored in local memory.
2. **OS Host Cache & Resolver**: Checks the operating system hosts file and local DNS cache.
3. **Recursive DNS Resolver (ISP / 1.1.1.1)**: If missing, sends a UDP query to the configured DNS resolver.
4. **Root & TLD Servers**: The resolver queries the Root server (\`.\`), the TLD server (\`.me\`), and finally the Authoritative Name Server for the domain to retrieve the target A/AAAA IP records.

\`\`\`
[ Browser ] ──UDP:53──► [ Resolver 1.1.1.1 ] ──► [ .me TLD Server ] ──► [ Authoritative DNS ]
                                                                                │
[ Browser ] ◄────────── Returns IP: 76.76.21.21 (Vercel Anycast IP) ────────────┘
\`\`\`

---

## Step 3: TCP 3-Way Handshake

Once the target IP address is resolved, the transport layer opens a reliable communication pipe using the **TCP (Transmission Control Protocol)** 3-way handshake:

1. **SYN**: Client sends a SYN packet with a random initial sequence number ($ISN_c$).
2. **SYN-ACK**: Server acknowledges with SYN-ACK ($ISN_s$, $ACK = ISN_c + 1$).
3. **ACK**: Client responds with ACK packet ($ACK = ISN_s + 1$).

This exchange costs **1 Round Trip Time (1 RTT)** across the physical network.

---

## Step 4: TLS 1.3 Cryptographic Handshake

Because HTTPS is enforced, the client and server must establish an encrypted channel before transmitting application data.

Under **TLS 1.3**, key negotiation happens in a single round trip (1-RTT):

\`\`\`
Client                                    Server
  │                                         │
  ├─── ClientHello (Diffie-Hellman Key) ───►│
  │                                         ├─── ServerHello (Encrypted Cert & Key)
  │◄── Finished (Symmetric Keys Ready) ─────┤
  │                                         │
  [=== Encrypted HTTP/2 Session Established ===]
\`\`\`

Using **Elliptic-Curve Diffie-Hellman (ECDHE)**, both parties derive a shared secret key without ever transmitting the secret over the network wire.

---

## Step 5: HTTP/2 Multiplexed Request and Response

With TLS established, the browser sends an HTTP request header frame:

\`\`\`http
GET /blog HTTP/2
Host: sahanpramuditha.me
User-Agent: Mozilla/5.0 ...
Accept: text/html,application/xhtml+xml
Accept-Encoding: gzip, deflate, br
\`\`\`

The server processes the request, pulls data from cache or database layers, and returns an HTTP 200 OK response stream compressed with Brotli or Gzip.

---

## Step 6: DOM Construction, Layout, and Render Tree

Once the first HTML bytes land in browser memory:

1. **HTML Parser**: Converts raw HTML bytes into DOM nodes.
2. **CSSOM Construction**: Parses linked CSS stylesheets into the CSS Object Model.
3. **Render Tree**: Combines DOM and CSSOM to compute visual element layouts.
4. **GPU Composite & Paint**: Rasterizes pixels onto the display surface.

When you master this flow, latency issues stop being mystery bugs and become measurable metrics to systematically optimize.`,
    codeSnippet: `// Timing browser network navigation metrics via Performance API
const timing = performance.getEntriesByType('navigation')[0];

console.log('DNS Lookup Time:', timing.domainLookupEnd - timing.domainLookupStart, 'ms');
console.log('TCP Handshake Time:', timing.connectEnd - timing.connectStart, 'ms');
console.log('TLS Negotiation Time:', timing.requestStart - timing.secureConnectionStart, 'ms');
console.log('Time to First Byte (TTFB):', timing.responseStart - timing.requestStart, 'ms');`,
    language: 'javascript',
    link: '/blog/monitoring-is-easy-knowing-it-will-break-is-hard'
  },
  {
    id: 'post-8',
    title: 'Monitoring Is Easy. Knowing Something Is About to Break Is Hard.',
    slug: 'monitoring-is-easy-knowing-it-will-break-is-hard',
    category: 'Networking',
    tags: 'Interlink, Monitoring, Networking, Reliability, Telemetry',
    author: 'Sahan Pramuditha',
    date: '2026-04-14',
    readTime: '9 min read',
    featured: false,
    status: 'Published',
    excerpt: 'Traditional monitoring waits until a service returns 500 errors or drops offline. While building Interlink, I learned how tracking packet jitter, TCP retry rates, and sliding-window latency anomalies can predict network outages before downtime occurs.',
    body: `### The Naive Uptime Status Page Fallacy

Most developer monitoring setups rely on a basic HTTP ping check:
- Send a \`GET /health\` request every 60 seconds.
- If status code is 200, display a green badge.
- If status code is 500 or times out, fire a Discord webhook alert.

This approach works for catastrophic failures, but it is completely blind to **degraded performance states**. 

A service that takes 8,000ms to respond is technically returning 200 OK, but to your end users, it is broken. A network node dropping 12% of TCP packets is still passing basic HTTP health checks, but user connections are silently retrying and lagging.

When I started engineering **Interlink**—a network monitoring telemetry system—my goal was to move beyond reactive status pages toward **predictive anomaly detection**.

---

## 1. Latency Jitter vs. Mean Response Time

If you measure only average response times, metrics lie to you. 

Consider two API endpoints with an average latency of 100ms:
- **Endpoint A**: 99ms, 101ms, 100ms, 98ms, 102ms (Stable).
- **Endpoint B**: 10ms, 10ms, 10ms, 10ms, 460ms (High Jitter!).

Endpoint B has severe **latency jitter** ($\\sigma^2$), indicating intermittent thread pool exhaustion or database lock contention. 

In Interlink, we implement **Standard Deviation and 99th Percentile (p99) metrics**:

\`\`\`javascript
export function calculateLatencyStats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  
  const variance = samples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);
  
  const p99Index = Math.floor(sorted.length * 0.99);
  const p99 = sorted[p99Index];

  return { mean, stdDev, p99 };
}
\`\`\`

---

## 2. Sliding Window Anomaly Detection

Instead of hardcoding fixed alert thresholds (e.g. *"Alert if latency > 500ms"*), predictive monitoring uses a **sliding window moving average**:

\`\`\`
[ Baseline Window (Past 60 Mins) ] ──► Compute Mean (μ) & StdDev (σ)
                                                │
[ Current Window (Past 3 Mins)  ] ──► Compare Current Mean against (μ + 3σ)
\`\`\`

If current 3-minute latency exceeds the baseline by more than **3 standard deviations ($3\\sigma$)**, Interlink flags a statistical anomaly—even if absolute latency is still under 300ms. This alerts engineers to subtle performance regressions immediately after a new deployment.

---

## 3. Correlating Packet Loss with Socket Retries

Network packet loss rarely happens in a binary fashion. It starts with minor 1–2% drops at edge routers due to buffer bloat.

By monitoring raw socket ICMP probes and TCP retransmission timers, Interlink visualizes degradation trends before total disconnection occurs:

\`\`\`typescript
interface NetworkProbeResult {
  timestamp: number;
  packetsSent: number;
  packetsReceived: number;
  rttSamplesMs: number[];
}

export function computePacketLossRatio(probe: NetworkProbeResult): number {
  if (probe.packetsSent === 0) return 0;
  const lost = probe.packetsSent - probe.packetsReceived;
  return (lost / probe.packetsSent) * 100;
}
\`\`\`

---

## Engineering Takeaways

Building telemetry systems teaches you to respect raw data. 

1. **Averages lie**: Always look at p95/p99 percentiles.
2. **Context matters**: A 200ms response time might be great for a global database query, but unacceptable for a local cache lookup.
3. **Early signals prevent outages**: By tracking statistical variance and packet jitter, you fix problems during minor degradation windows long before the status badge turns red.`,
    codeSnippet: `// Sliding window anomaly detector
export class AnomalyDetector {
  constructor(windowSize = 30, thresholdSigma = 3) {
    this.history = [];
    this.windowSize = windowSize;
    this.thresholdSigma = thresholdSigma;
  }

  addSample(value) {
    this.history.push(value);
    if (this.history.length > this.windowSize) this.history.shift();
  }

  isAnomaly(newValue) {
    if (this.history.length < 10) return false;
    const mean = this.history.reduce((a, b) => a + b, 0) / this.history.length;
    const stdDev = Math.sqrt(this.history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.history.length);
    return newValue > mean + (this.thresholdSigma * stdDev);
  }
}`,
    language: 'javascript',
    link: '/blog/learning-networking-software-in-a-vacuum'
  },
  {
    id: 'post-9',
    title: "I Started Learning Networking Because Software Doesn't Live in a Vacuum",
    slug: 'learning-networking-software-in-a-vacuum',
    category: 'Networking',
    tags: 'Networking, Systems, Engineering Growth, Web Architecture',
    author: 'Sahan Pramuditha',
    date: '2026-03-30',
    readTime: '8 min read',
    featured: false,
    status: 'Published',
    excerpt: 'Many software developers treat the network as an abstract black box that magically delivers JSON payloads. Learning TCP/IP, OSI layers, DNS caching, and socket lifecycles made me a dramatically better software engineer.',
    body: `### The "It's an API Issue" Delusion

Early in my development journey, whenever a web app loaded slowly or failed to sync data, my diagnostic process was shallow:
- If my local code threw an error: Fix the code.
- If \`fetch()\` timed out or failed: Blame the backend server or API provider.

To me, the network between the client and server was an invisible, friction-free magic pipe. 

It was only when I began building distributed applications and network telemetry tools that I realized **the network is neither invisible nor friction-free**. It is a dynamic physical environment with latency limits, packet loss, queue congestion, and security boundaries.

Learning computer networking fundamentals transformed the way I write software. Here is why every developer should master networking.

---

## 1. Network Constraints Dictate API Architecture

When you understand that every HTTP connection requires TCP and TLS handshakes, you stop designing inefficient API patterns.

### Bad Pattern: The Chatty N+1 API Problem
A frontend component makes 20 separate fetch requests inside a loop to pull details for 20 items:

\`\`\`javascript
// 20 separate round trips over mobile 4G latency (100ms per RTT) = 2,000ms minimum delay!
const items = await Promise.all(ids.map(id => fetch(\`/api/items/\${id}\`).then(r => r.json())));
\`\`\`

### Engineered Pattern: Batch Querying & Connection Reuse
A network-aware engineer designs endpoints that support batched IDs or GraphQL queries, allowing a single HTTP/2 multiplexed stream to return all payloads in 1 Round Trip Time:

\`\`\`javascript
// 1 multiplexed request = 100ms total latency!
const items = await fetch(\`/api/items?ids=\${ids.join(',')}\`).then(r => r.json());
\`\`\`

---

## 2. Demystifying CORS (Cross-Origin Resource Sharing)

Every web developer has encountered the dreaded browser error:
\`Access to fetch at 'api.example.com' from origin 'localhost:3000' has been blocked by CORS policy\`

Without networking knowledge, developers fix this by copying random stackoverflow code snippets or installing browser plugins that disable security.

With networking knowledge, you understand that **CORS is a browser-enforced security boundary**, not a server network block. For non-simple HTTP requests (e.g. custom authorization headers or PUT/DELETE methods), the browser automatically issues a **Preflight OPTIONS request**:

\`\`\`http
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://sahanpramuditha.me
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization
\`\`\`

If the server backend does not respond to \`OPTIONS\` with valid \`Access-Control-Allow-Origin\` headers, the browser blocks the actual payload request from ever firing.

---

## 3. TCP Connection Pooling & Keep-Alive

Creating a TCP socket connection is expensive (CPU overhead for handshake + network RTT delay).

When building backend services in Node.js or Go, a network-aware developer explicitly enables **HTTP Keep-Alive agent connection pooling**:

\`\`\`javascript
import http from 'node:http';
import https from 'node:https';

// Reuses existing open TCP sockets for outgoing API requests
export const keepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  keepAliveMsecs: 30000
});
\`\`\`

This simple network optimization reduced outgoing API latency by 40% in microservice benchmarking.

---

## The Network-Aware Engineer Mindset

Software does not execute in an isolated sandbox. It runs on physical silicon connected through fiber-optic cables, cellular towers, and routing switches.

When you learn how packets flow, how sockets open and close, and how protocols negotiate state, you write faster code, debug production outages in minutes instead of days, and build software that thrives in the real world.`,
    codeSnippet: `// Example: Configuring Keep-Alive agent in Node.js fetch
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({ keepAlive: true });

export function fetchWithSocketReuse(url) {
  return fetch(url, { agent });
}`,
    language: 'javascript',
    link: '/blog/what-happens-when-you-open-a-website'
  },
  {
    id: 'post-10',
    title: 'What Happens When You Make a Portfolio Too Cool?',
    slug: 'what-happens-when-you-make-a-portfolio-too-cool',
    category: 'Web Development',
    tags: 'Portfolio, WebGL, Three.js, Performance, UI/UX',
    author: 'Sahan Pramuditha',
    date: '2026-03-12',
    readTime: '8 min read',
    featured: true,
    status: 'Published',
    excerpt: '3D globes, GLSL particle fields, and real-time lighting look incredible on a modern developer workstation. But if your portfolio melts low-power mobile batteries or lags on budget laptops, you have failed the most basic rule of user experience.',
    body: `### The Traps of Creative Web Over-Engineering

When I first redesigned this portfolio, I had one overriding goal: **Make a visually stunning space-themed interactive experience.**

I loaded Three.js, built real-time WebGL particle fields, rendered dynamic 3D globe models with atmosphere shaders, added custom cursor physics, and layered smooth scroll animations. On my dedicated dev workstation with a high-end discrete GPU, the site ran at a silky-smooth 144 FPS. I was thrilled.

Then I opened the live site on an entry-level smartphone.

The fan spun up, the battery icon drained rapidly, the frame rate plummeted to 14 FPS, and the browser page crashed due to out-of-memory limits.

That was a humbling wake-up call. I had fallen into the classic developer trap: **Optimizing for my own high-end hardware while ignoring real-world users.**

---

## The Real Cost of WebGL Features

3D graphics on the web are not free. Every canvas feature consumes concrete hardware resources:

1. **GPU Shader Execution**: Complex GLSL fragment shaders calculating Perlin noise on every pixel strain integrated GPUs.
2. **Draw Calls & Memory Footprint**: Uninstanced 3D mesh geometries load megabytes of vertex data into VRAM.
3. **Main Thread Blocking**: Running heavy JavaScript physics loops alongside React DOM reconciliations freezes scrolling interactions.

---

## The Optimization & Resilience Strategy

I refused to abandon the interactive 3D vision, so I re-engineered the portfolio's visual pipeline around **adaptive performance scaling**.

### 1. Hardware Capability Detection

Before initializing heavy 3D canvases, the application evaluates the client environment:

\`\`\`javascript
export function shouldDisableHeavyVisuals() {
  // Check for explicit reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for low device memory API (under 4GB RAM)
  const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  
  // Check hardware concurrency (under 4 CPU cores)
  const isLowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  return prefersReducedMotion || isLowMemory || isLowCpu;
}
\`\`\`

### 2. Adaptive Frame Rate Throttling & Visibility Pausing

Why render 60 frames per second when the user scrolls past the 3D canvas section?

Using \`IntersectionObserver\` and canvas lifecycle hooks, Three.js render loops pause automatically when canvas components scroll out of the active viewport:

\`\`\`jsx
// Pause Three.js render loop when off-screen
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    setIsCanvasActive(entry.isIntersecting);
  }, { threshold: 0.1 });

  if (containerRef.current) observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
\`\`\`

### 3. Graceful Fallback Modes (\`lite-mode\`)

For mobile viewports or devices with low GPU capabilities, the site automatically toggles into a sleek \`lite-mode\`, replacing heavy WebGL canvases with lightweight CSS radial gradients while maintaining the dark space aesthetic.

---

## The Core UX Philosophy

A developer portfolio is not a video game demo; it is a presentation of your skills, projects, and engineering judgment.

A truly great developer portfolio balances **visual delight with flawless performance**. If your site looks amazing but takes 6 seconds to load or stutters during navigation, visitors will leave before ever reading your case studies.

Experience the interactive balance yourself by exploring the projects section on the [Portfolio Home Page](/).`,
    codeSnippet: `// Canvas lifecycle pause hook
import { useState, useEffect, useRef } from 'react';

export function useCanvasVisibility() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}`,
    language: 'typescript',
    link: '/blog/designing-for-people-without-gaming-pcs'
  },
  {
    id: 'post-11',
    title: 'Designing for People Who Don\'t Have a Gaming PC',
    slug: 'designing-for-people-without-gaming-pcs',
    category: 'Performance',
    tags: 'Performance, Accessibility, UX, Web Vitals, Mobile',
    author: 'Sahan Pramuditha',
    date: '2026-02-24',
    readTime: '7 min read',
    featured: false,
    status: 'Published',
    excerpt: 'It is easy to forget that millions of users access the web over 3G networks on 4-year-old budget smartphones. Web performance is not just an engineering metric—it is an accessibility requirement.',
    body: `### The Privilege of Fast Development Machines

As software engineers, our daily tools skew our perception of digital performance. We code on multi-core laptops connected to high-speed fiber internet networks.

When an unoptimized web bundle takes 4MB to download locally, it loads in 80 milliseconds over localhost. We barely notice.

In the real world:
- The median mobile connection speed in many regions fluctuates between 5 Mbps and 15 Mbps.
- A large portion of global web traffic originates from budget mobile devices with limited RAM and thermal throttling under load.

If your application requires a high-performance CPU to scroll smoothly, you are actively excluding users. **Web performance is accessibility.**

---

## The Four Pillars of Web Performance Empathy

### 1. Bundle Budget Discipline

Do not import a 100KB JavaScript library to perform a task that can be accomplished in 10 lines of native ES6 code.

Before adding a third-party \`npm\` package, ask:
- Can this be done with native browser APIs (e.g. \`date-fns\` vs native \`Intl.DateTimeFormat\`)?
- Does the package support tree-shaking?

### 2. Image and Asset Optimization

Uncompressed JPEG images uploaded directly from camera phones are silent performance killers.

In this portfolio:
- All cover images are converted to modern **WebP/AVIF** formats.
- Images use explicit \`width\` and \`height\` attributes to eliminate **Cumulative Layout Shift (CLS)**.
- Images below the fold use native \`loading="lazy"\`.

\`\`\`html
<!-- Optimized image markup preventing layout shift -->
<img 
  src="/assets/projects/studyos-cover.webp" 
  alt="StudyOS Workspace Interface" 
  width="800" 
  height="450" 
  loading="lazy" 
  decoding="async" 
/>
\`\`\`

---

## 3. Minimizing Main Thread Blocking (INP & LCP)

The browser main thread handles user input, layout calculation, and JavaScript execution. If JavaScript runs a long sync loop exceeding 50ms, the main thread freezes, ignoring user button clicks and touch scrolls.

We measure performance using Google's **Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: Core content visible under 2.5 seconds.
- **INP (Interaction to Next Paint)**: User tap response under 200 milliseconds.
- **CLS (Cumulative Layout Shift)**: Visual stability score under 0.1.

---

## Empathy Driven Engineering

Building for low-end devices is not about stripping away joy or visual beauty. It is about **smart resource prioritization**:
1. Load core content and text instantly.
2. Hydrate interactivity progressively.
3. Defer visual flair until main thread work is complete.

When you engineer with empathy for budget hardware, your applications become faster, cleaner, and accessible to everyone.`,
    codeSnippet: `// Example: Lazy loading component helper with fallback
import React, { Suspense, lazy } from 'react';

const HeavyChartComponent = lazy(() => import('./HeavyChartComponent'));

export function AnalyticsWidget() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-secondary/30 rounded-xl" />}>
      <HeavyChartComponent />
    </Suspense>
  );
}`,
    language: 'typescript',
    link: '/blog/why-my-portfolio-isnt-like-every-other-portfolio'
  },
  {
    id: 'post-12',
    title: 'Why I Don\'t Want My Portfolio to Look Like Every Other Developer Portfolio',
    slug: 'why-my-portfolio-isnt-like-every-other-portfolio',
    category: 'Web Development',
    tags: 'Portfolio, Design, Philosophy, Branding, UI/UX',
    author: 'Sahan Pramuditha',
    date: '2026-02-10',
    readTime: '6 min read',
    featured: false,
    status: 'Published',
    excerpt: 'Most developer portfolios follow a predictable template: a generic hero heading, a grid of tutorial project cards, and a basic contact form. Here is the design philosophy behind building an interactive, space-themed portfolio that tells a personal engineering story.',
    body: `### The Era of Template Monoculture

If you spend an hour browsing developer portfolios on Twitter, LinkedIn, or GitHub, a distinct pattern emerges. 

Ninety percent of developer portfolios look identical:
- White or plain dark background.
- Standard bold heading: *"Hi, I'm [Name], a passionate Full Stack Developer."*
- Three project cards linking to a To-Do App, a Weather App, and a Twitter clone.
- A progress bar list claiming "React: 90%, JavaScript: 85%".
- A standard contact form.

There is nothing inherently wrong with these templates. They are clean and functional. But they fail to answer the most important question a recruiter or potential collaborator has: **Who are you as a thinker, a builder, and an engineer?**

---

## The Space & Telemetry Visual Identity

When designing this portfolio, I wanted the visual experience to reflect my genuine interests: **systems engineering, space technology, interactive graphics, and deep technical exploration.**

Instead of a static resume page, I designed the site around an **interactive space telemetry control panel**:

1. **Terminal Aesthetics**: Monospace typography elements (\`Space Mono\`), mission codes (\`PRJ-001\`), and status badges.
2. **Interactive 3D Elements**: Custom WebGL background visualizers representing orbital paths and telemetry data nodes.
3. **Comprehensive Case Studies**: Moving beyond simple project cards to present real architecture decisions, trade-offs, and lessons learned.

---

## Storytelling Over Skill Progress Bars

I deliberately avoided using arbitrary percentage skill bars (*"CSS: 88%"*). What does 88% CSS competence even mean?

Instead, I focus on **demonstrable outcomes and technical depth**:
- Instead of saying *"I know networking"*, I document how I built [Interlink](/blog/monitoring-is-easy-knowing-it-will-break-is-hard) to track packet loss and latency jitter.
- Instead of saying *"I know React"*, I detail how I optimized state debouncing in [StudyOS](/projects/studyos) to keep frame rates at 60 FPS.

---

## Creating Memorable Web Experiences

A great portfolio should feel alive. Small micro-interactions—like custom glow cards responding to mouse coordinates, smooth section transitions, and interactive terminal widgets—create an experience that visitors remember.

The goal is not to show off flashy tricks for the sake of it. The goal is to build an environment that reflects your passion for software craftsmanship.

Explore the open-source architecture of this portfolio on [GitHub](/opensource).`,
    codeSnippet: `// GlowCard mouse tracking cursor calculation snippet
const handleMouseMove = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.setProperty('--mouse-x', \`\${x}px\`);
  card.style.setProperty('--mouse-y', \`\${y}px\`);
};`,
    language: 'javascript',
    link: '/opensource'
  },
  {
    id: 'post-13',
    title: 'Tutorial Hell vs Actually Building Things',
    slug: 'tutorial-hell-vs-actually-building-things',
    category: 'Learning',
    tags: 'Learning, Growth, Projects, Mindset, Education',
    author: 'Sahan Pramuditha',
    date: '2026-01-26',
    readTime: '7 min read',
    featured: false,
    status: 'Published',
    excerpt: 'Watching 40 hours of video courses gives a comfortable illusion of progress. True learning only begins when you close the video player, open a blank editor, hit an unhandled error, and figure out how to solve it yourself.',
    body: `### The Comfortable Trap of Passive Learning

"Tutorial Hell" is a state familiar to almost every self-taught software student:

You decide to learn a new framework—say, Next.js or Rust. You buy a top-rated 50-hour video course. You follow along diligent step by step, typing the exact code the instructor types. The app works on screen. You feel productive, intelligent, and capable.

Then the course ends. You open a blank code editor to build your own custom project ideas.

Suddenly, you hit a wall. You don't know where to start. The moment an unexpected version mismatch or build error occurs, you panic because there is no instructor on video to explain the solution.

You feel defeated, so you buy another 40-hour video tutorial course. The cycle repeats.

---

## Why Tutorials Create False Confidence

Video courses are engineered to be friction-free. Instructors have spent hours pre-debugging setup errors, editing out build failures, and choosing perfect library versions.

When you follow a video:
- You are practicing **typing speed and pattern copying**.
- You are **not** practicing problem breakdown, error diagnosis, documentation reading, or architectural decision-making.

Real engineering consists almost entirely of those missing skills.

---

## How I Broke Free: The "Project First" Method

The turning point in my learning journey happened when I stopped starting with courses and began starting with **imperfect projects**.

When I decided to build **I-Store ERP**, I didn't take a 30-hour course on enterprise software architecture. I wrote down a minimal list of features I wanted to build and started coding immediately.

Predictably, I got stuck within the first hour:
1. *How do I handle React state for dynamic invoice rows?* -> Searched React docs on array state mutation.
2. *How do I connect to SQLite database?* -> Read driver documentation and code examples.
3. *Why is my query throwing a SQL syntax error?* -> Learned to read stack traces and inspect raw SQL outputs.

Because every piece of documentation I read was directly tied to solving an immediate problem in my own project, the knowledge stuck permanently.

---

## The 20/80 Rule of Learning

| Phase | Strategy | Time Allocation |
| :--- | :--- | :--- |
| **Overview** | Watch 1-2 fast high-level overview videos to learn core concepts | **20%** |
| **Building** | Open blank editor & build an original project using official docs | **80%** |

Stop waiting until you feel "ready" to build independent projects. You will never feel fully ready. The fastest way to learn software engineering is to embrace the discomfort of broken code and figure your way out.`,
    codeSnippet: `// The ultimate debugging mental algorithm
export function debugWorkflow(errorStack) {
  console.log("1. Read the error message carefully (do not ignore line numbers).");
  console.log("2. Isolate the exact line where execution failed.");
  console.log("3. Console.log / breakpoint inspect variable states before that line.");
  console.log("4. Read the official documentation for the library function.");
  console.log("5. Search GitHub issues or Stack Overflow for specific error strings.");
}`,
    language: 'javascript',
    link: '/blog/things-i-wish-i-knew-first-serious-project'
  },
  {
    id: 'post-14',
    title: 'Things I Wish I Knew Before Starting My First Serious Software Project',
    slug: 'things-i-wish-i-knew-first-serious-project',
    category: 'Learning',
    tags: 'Git, Architecture, Planning, Tech Debt, Hard Lessons',
    author: 'Sahan Pramuditha',
    date: '2026-01-14',
    readTime: '8 min read',
    featured: false,
    status: 'Published',
    excerpt: 'Scope creep, unversioned database schemas, pushing directly to master branches, missing backups, and hardcoded secrets. Here are the painful, real-world lessons I learned from my first major projects.',
    body: `### The Excitement vs. Maintenance Curve

Starting a brand-new software project is exhilarating. You have a clean repository, zero technical debt, unlimited ideas, and total creative freedom.

Six months later, that same project can turn into a stressful maintenance chore if you failed to establish foundational engineering practices early on.

Looking back at my early projects, here are six crucial lessons I wish someone had hammered into my head on day one.

---

## 1. Git Is Not Just a Backup Button: Master Branching Discipline

In my early projects, I committed everything directly to the \`main\` branch with commit messages like \`"fix bug"\`, \`"updates"\`, and \`"asdf"\`.

When a production deployment broke, rolling back to a stable state was nearly impossible because 10 unrelated features were mixed into single commits.

**The Fix**: Use clear Feature Branching workflows and semantic commit messages:

\`\`\`bash
# Feature branch workflow
git checkout -b feature/auth-jwt-refresh
git commit -m "feat(auth): add automatic JWT token refresh interceptor"
\`\`\`

---

## 2. Never Hardcode Configuration Values or Secrets

Hardcoding API keys, database connection strings, or port numbers directly in source code files is a massive security hazard.

\`\`\`javascript
// Dangerous: Secret committed to version control history!
const dbUri = "mongodb+srv://admin:Password123@cluster0.mongodb.net/production";
\`\`\`

Once a secret is committed to a public Git repository, it remains in the Git object history forever—even if you delete the line in a later commit.

**The Fix**: Store all configuration in environment variables (\`.env\`) and add \`.env\` to your \`.gitignore\` file before your very first commit.

---

## 3. Database Schema Normalization Saves Months of Pain

When designing database tables for early projects, I rushed through schema design, throwing JSON objects into single string columns to avoid setting up relational tables.

When the application grew and required querying nested fields, running analytics became slow and complex.

Spend time upfront designing **clean, normalized database schemas with proper foreign key constraints, indexes, and migration scripts**.

---

## 4. Beware of Scope Creep

The quickest way to kill a project is to keep adding new feature ideas before completing core functionality.

Define a strict **Minimum Viable Product (MVP)** scope. Finish the core user flow, launch it, gather feedback, and then iterate. An imperfect published project is infinitely more valuable than a grand, unfinished idea sitting on your hard drive.

---

## Summary Checklist for New Projects

1. Initialize Git & configure \`.gitignore\` immediately.
2. Set up \`.env.example\` for required environment variables.
3. Design database schemas on paper before writing code.
4. Establish automated build checking (\`npm run build\` / linting).
5. Define MVP scope and stick to it strictly until release.`,
    codeSnippet: `# Essential initial .gitignore file
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log`,
    language: 'bash',
    link: '/blog/software-engineering-student-future-goals'
  },
  {
    id: 'post-15',
    title: 'I\'m a Software Engineering Student. Here\'s What I\'m Actually Trying to Become.',
    slug: 'software-engineering-student-future-goals',
    category: 'Developer Experience',
    tags: 'Career, Student Journey, Mission, Engineering Ethos, Personal',
    author: 'Sahan Pramuditha',
    date: '2025-12-20',
    readTime: '6 min read',
    featured: true,
    status: 'Published',
    excerpt: 'I am not interested in collecting superficial framework badges or chasing technology hypes. My goal as a software engineering student at the University of Colombo is to build resilient, human-centered systems that solve hard real-world problems.',
    body: `### Beyond the Job Title

When people ask what I study at university, the standard answer is *"Software Engineering"*.

In tech culture, that answer is often immediately associated with specific job titles or trend badges: *"React Developer"*, *"Full Stack Cloud Engineer"*, or *"AI Prompt Specialist"*.

Frameworks come and go. Libraries rise to popularity and disappear within five years. If your identity as a developer is tied exclusively to a specific tool or syntax, your skills decay alongside that framework's lifecycle.

As a student developer, I am building toward a broader vision of what it means to be a software engineer.

---

## The Three Pillars of My Engineering Journey

### 1. Fundamental Computer Science Competence
Frameworks are just abstractions built on top of fundamentals. My primary focus is mastering the underlying principles that outlast tech trends:
- Operating system concurrency, process scheduling, and memory models.
- Networking protocols (TCP/IP, HTTP/3, WebSockets, DNS).
- Data structures, algorithm analysis, and database storage engines.

When you understand the fundamentals, learning a new framework or programming language takes days instead of months.

### 2. Pragmatic Software Craftsmanship
I believe in building software that is clean, well-tested, robust, and performant. 

Whether working on personal research projects like [StudyOS](/projects/studyos), graphics engines like [Stardust Engine](/projects/stardust-engine), or enterprise platforms like [I-Store ERP](/projects/istore), I hold myself to rigorous standards of code quality, documentation, and user experience.

### 3. Human-Centered System Design
Software does not exist in an academic vacuum. Technology is valuable only when it empowers human beings, simplifies complex workflows, or solves real real-world problems.

---

## My Mission Moving Forward

I am actively learning, experimenting, failing, and building every day. 

I don't claim to have all the answers or decades of senior experience. What I bring is **relentless curiosity, strong technical discipline, a deep respect for computer science fundamentals, and an obsession with quality**.

If you share a passion for building great systems, feel free to explore my [Projects](/projects), inspect my open-source code on [GitHub](/opensource), or [reach out directly](/contact) to connect.`,
    codeSnippet: `// Sahan Pramuditha - Core Engineering Philosophy
const engineerProfile = {
  name: "Sahan Pramuditha",
  role: "Software Engineering Student @ University of Colombo",
  focusAreas: ["Software Systems", "AI & RAG Architecture", "Computer Networks", "Interactive 3D Web Graphics"],
  ethos: "Master fundamentals, build with empathy, engineering for resilience."
};`,
    language: 'javascript',
    link: '/contact'
  }
];
