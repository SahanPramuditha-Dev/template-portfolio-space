/**
 * Orbital AI Assistant Intelligence Engine
 * Handles contextual knowledge retrieval across portfolio CMS data (About, Skills, Experience, Projects, Badges, Certifications)
 * Provides instant grounded responses, navigation actions, and optional Google Gemini API fallback.
 */

export const QUICK_SUGGESTIONS = [
  '⚡ What are Sahan\'s top technical skills?',
  '🚀 Tell me about featured projects',
  '💼 What is Sahan\'s work & education background?',
  '🏆 Show verified certifications & badges',
  '✉️ Is Sahan available for hire or freelance?',
  '📄 How can I get Sahan\'s resume / CV?'
];

export const buildPortfolioContext = ({ siteDoc, projects = [], skills = [], experience = [], certs = [], badges = [] }) => {
  const bio = siteDoc?.aboutParagraphs || 'Sahan Pramuditha is a Software Engineer & Creative Developer based in Sri Lanka, currently pursuing a Bachelor of Information and Communication Technology (BICT) at the University of Colombo.';
  const availability = siteDoc?.availability || 'Open to freelance, part-time, and select full-time engineering roles.';
  const contactEmail = siteDoc?.contactEmail || 'contact@sahanpramuditha.com';

  const projectSummaries = projects.slice(0, 10).map(p => 
    `- ${p.title} (${p.category || 'Web App'}): ${p.shortDescription || p.description || ''}. Tech: ${(Array.isArray(p.tech) ? p.tech : []).join(', ')}. Slug: ${p.slug || p.id}`
  ).join('\n');

  const expSummaries = experience.map(e => 
    `- ${e.title} at ${e.organization} (${e.period}): ${e.description}`
  ).join('\n');

  const certSummaries = certs.slice(0, 8).map(c => 
    `- ${c.title} by ${c.issuer} (${c.issueDate || ''})`
  ).join('\n');

  const badgeSummaries = badges.slice(0, 10).map(b => 
    `- ${b.title} (${b.issuer}): ${(Array.isArray(b.skills) ? b.skills : []).join(', ')}`
  ).join('\n');

  return {
    bio,
    availability,
    contactEmail,
    projectSummaries,
    expSummaries,
    certSummaries,
    badgeSummaries
  };
};

/**
 * Intelligent Local Heuristic Matcher & Grounded Answer Generator
 * Generates natural, structured answers with action buttons without needing external API keys.
 */
export const queryLocalOrbitalBrain = (userQuery, context) => {
  const q = userQuery.toLowerCase().trim();

  // 1. Availability / Hiring / Freelance / Contact
  if (q.includes('hire') || q.includes('available') || q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('freelance') || q.includes('job') || q.includes('work with')) {
    return {
      text: `**Status**: Currently **available for new opportunities**.\n\n` +
            `• **Availability**: ${context.availability}\n` +
            `• **Preferred Contact**: Direct transmission via the [Contact Form](#contact) or email at **${context.contactEmail}**.\n` +
            `• **Response Time**: Usually replies within 1–2 business days.`,
      actions: [
        { label: '✉️ Send Message', href: '#contact', type: 'scroll' },
        { label: '📄 View Resume', href: '/resume', type: 'link' }
      ]
    };
  }

  // 2. Resume / CV / Download
  if (q.includes('resume') || q.includes('cv') || q.includes('curriculum') || q.includes('pdf') || q.includes('download')) {
    return {
      text: `Here's the CV overview based on the portfolio:\n\n` +
            (context.expSummaries
              ? `**Experience & Education:**\n${context.expSummaries}`
              : `**Bio:** ${context.bio}`),
      actions: [
        { label: '📄 Open Digital CV', href: '/resume', type: 'link' },
        { label: '⬇️ Download PDF', href: '/resume.pdf', type: 'download' }
      ]
    };
  }

  // 3. Projects
  if (q.includes('project') || q.includes('built') || q.includes('app') || q.includes('portfolio') || q.includes('work') || q.includes('wybe') || q.includes('pos') || q.includes('i-store') || q.includes('studyos')) {
    const projectLines = context.projectSummaries
      ? context.projectSummaries.split('\n').filter(Boolean).slice(0, 5).join('\n')
      : '• No project data loaded yet.';

    return {
      text: `Here are some featured projects from the portfolio:\n\n${projectLines}\n\nWould you like to explore the interactive project case studies?`,
      actions: [
        { label: '🚀 Explore All Projects', href: '#projects', type: 'scroll' },
        { label: '📁 View Full Case Studies', href: '/projects', type: 'link' }
      ]
    };
  }

  // 4. Skills & Tech Stack
  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('react') || q.includes('node') || q.includes('mongo') || q.includes('python') || q.includes('language') || q.includes('framework') || q.includes('tool') || q.includes('database') || q.includes('cloud')) {
    const bio = context.bio || '';
    return {
      text: `**Technical Capabilities** based on the portfolio:\n\n` +
            (context.badgeSummaries
              ? `**Verified Skills & Badges:**\n${context.badgeSummaries.split('\n').slice(0, 6).join('\n')}`
              : bio),
      actions: [
        { label: '⚙️ Inspect Skills Section', href: '#skills', type: 'scroll' },
        { label: '🛡️ View Digital Badges', href: '#badges', type: 'scroll' }
      ]
    };
  }

  // 5. Experience / Education / Background
  if (q.includes('experience') || q.includes('education') || q.includes('university') || q.includes('colombo') || q.includes('degree') || q.includes('background') || q.includes('history') || q.includes('career')) {
    const expText = context.expSummaries
      ? context.expSummaries.split('\n').filter(Boolean).slice(0, 4).join('\n')
      : context.bio || 'No experience data loaded yet.';

    return {
      text: `**Background & Education** from the portfolio:\n\n${expText}`,
      actions: [
        { label: '💼 View Timeline', href: '#experience', type: 'scroll' },
        { label: '👤 Read About Bio', href: '#about', type: 'scroll' }
      ]
    };
  }

  // 6. Certifications & Badges
  if (q.includes('certificate') || q.includes('cert') || q.includes('badge') || q.includes('credential') || q.includes('award') || q.includes('qualification') || q.includes('gcp')) {
    const certText = context.certSummaries
      ? context.certSummaries.split('\n').filter(Boolean).slice(0, 6).join('\n')
      : 'No certification data loaded yet.';

    const badgeText = context.badgeSummaries
      ? '\n\n**Digital Badges:**\n' + context.badgeSummaries.split('\n').filter(Boolean).slice(0, 4).join('\n')
      : '';

    return {
      text: `**Certifications & Credentials** from the portfolio:\n\n${certText}${badgeText}`,
      actions: [
        { label: '🏆 View Certifications', href: '#certifications', type: 'scroll' },
        { label: '🛡️ View Digital Badges', href: '#badges', type: 'scroll' }
      ]
    };
  }

  // 7. About / Personal
  if (q.includes('who are you') || q.includes('who is') || q.includes('about') || q.includes('sahan') || q.includes('tell me')) {
    return {
      text: `${context.bio}\n\nHow can I assist you with exploring this portfolio?`,
      actions: [
        { label: '👤 About', href: '#about', type: 'scroll' },
        { label: '🚀 Featured Work', href: '#projects', type: 'scroll' },
        { label: '✉️ Get in Touch', href: '#contact', type: 'scroll' }
      ]
    };
  }

  // Fallback
  return {
    text: `I'm **Nova**, the portfolio co-pilot! 🛰️\n\n` +
          `I can help you explore:\n` +
          `• **Technical Stack** — skills, frameworks & tools\n` +
          `• **Project Case Studies** — real-world builds and live demos\n` +
          `• **Experience & Education** — background and career timeline\n` +
          `• **Hiring & Availability** — how to collaborate.\n\n` +
          `What would you like to know?`,
    actions: [
      { label: '⚡ Top Skills', href: '#skills', type: 'scroll' },
      { label: '🚀 Featured Projects', href: '#projects', type: 'scroll' },
      { label: '✉️ Contact', href: '#contact', type: 'scroll' }
    ]
  };
};

/**
 * Optional Google Gemini LLM Caller (when VITE_GEMINI_API_KEY is present)
 */
export const queryGeminiApi = async (userPrompt, context, apiKey) => {
  const systemInstruction = `You are Nova, the space-themed, highly capable and professional AI portfolio assistant for Sahan Pramuditha.
You speak clearly, enthusiastically, and with technical authority. Keep answers concise (2-4 paragraphs max), formatting with bullet points and bold highlights.

Ground your answers strictly on Sahan's background:
- Role: Software Engineer & Creative Developer
- Education: Bachelor of Information and Communication Technology (BICT) at University of Colombo
- Specialization: React, Node.js, TypeScript, Three.js/WebGL, MongoDB, Cloud (AWS/GCP), E-Commerce operations (Wybe.lk)
- Availability: ${context.availability}
- Email: ${context.contactEmail}
- Projects: ${context.projectSummaries}
- Experience: ${context.expSummaries}
- Badges: ${context.badgeSummaries}

Always be helpful, encouraging recruiters to explore projects, view case studies, or reach out through the contact section.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }] }
        ]
      })
    });

    if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);
    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('No response from Gemini API');

    return {
      text: candidateText,
      actions: [
        { label: '🚀 View Projects', href: '#projects', type: 'scroll' },
        { label: '✉️ Contact Sahan', href: '#contact', type: 'scroll' }
      ]
    };
  } catch (err) {
    console.warn('Gemini API fallback to local intelligence:', err);
    return null;
  }
};
