import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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

const reposToImport = [
  { name: 'skyShift', featured: false, category: 'Software Engineering', mission: 'SKYSHIFT' },
  { name: 'Python-Password-Cracker', featured: true, category: 'System Security', mission: 'PASSCRACK' },
  { name: 'Syslens', featured: true, category: 'Developer Tooling', mission: 'SYSLENS' },
  { name: 'GhostLink-React', featured: true, category: 'Web Apps', mission: 'GHOSTLINK' },
  { name: 'I-Store-Website', featured: false, category: 'E-Commerce', mission: 'ISTORE' },
  { name: 'StudyOS', featured: true, category: 'Web Apps', mission: 'STUDYOS' },
  { name: 'template-portfolio-space', featured: true, category: 'Web Apps', mission: 'SPACEPORT' }
];

async function fetchGitHubData(repoName) {
  try {
    console.log(`Fetching info for ${repoName}...`);
    const infoRes = await fetch(`https://api.github.com/repos/SahanPramuditha-Dev/${repoName}`);
    if (!infoRes.ok) throw new Error(`Repo info returned ${infoRes.status}`);
    const repoInfo = await infoRes.json();

    console.log(`Fetching languages for ${repoName}...`);
    const langRes = await fetch(`https://api.github.com/repos/SahanPramuditha-Dev/${repoName}/languages`);
    const languages = langRes.ok ? Object.keys(await langRes.json()) : [];

    console.log(`Fetching README for ${repoName}...`);
    const readmeRes = await fetch(`https://api.github.com/repos/SahanPramuditha-Dev/${repoName}/readme`);
    let readmeDecoded = '';
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      if (readmeData.content) {
        readmeDecoded = Buffer.from(readmeData.content, 'base64').toString('utf8');
      }
    }

    return { repoInfo, languages, readme: readmeDecoded };
  } catch (err) {
    console.error(`Failed to fetch from GitHub for ${repoName}:`, err.message);
    return null;
  }
}

async function run() {
  try {
    console.log('Logging in to Firebase auth as admin...');
    await signInWithEmailAndPassword(auth, 'sahanpramuditha91@gmail.com', 'Sahan@910');
    console.log('Authentication successful!');

    console.log('Fetching current projects document from Firestore...');
    const docRef = doc(db, 'content', 'projects');
    const docSnap = await getDoc(docRef);
    let currentItems = [];
    if (docSnap.exists()) {
      currentItems = docSnap.data().items || [];
      console.log(`Found ${currentItems.length} existing projects in database.`);
    } else {
      console.log('No existing projects document. Creating a new list...');
    }

    const updatedItems = [...currentItems];

    for (const repo of reposToImport) {
      console.log(`\n--- Starting Import for: ${repo.name} ---`);
      const gitData = await fetchGitHubData(repo.name);
      if (!gitData) continue;

      const { repoInfo, languages, readme } = gitData;
      const slug = repo.name.toLowerCase();

      // Check if project already exists
      const existingIdx = updatedItems.findIndex(item => (item.slug === slug || item.id === slug));

      const finalTitle = repo.name
        .replace(/-/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const year = repoInfo?.created_at ? new Date(repoInfo.created_at).getFullYear() : 2026;
      const defaultShortDesc = repoInfo?.description || 'Open source software project by Sahan Pramuditha.';
      
      const newProject = {
        id: slug,
        slug: slug,
        title: repo.name === 'skyShift' ? 'skyShift' : finalTitle,
        missionCode: repo.mission,
        year: year,
        shortDescription: defaultShortDesc,
        valueProposition: defaultShortDesc,
        category: repo.category,
        status: 'Live',
        client: 'Personal Research / Open Source',
        industry: repo.category === 'System Security' ? 'Security / Cryptography' : 'Software Engineering',
        teamSize: '1 (Sole Developer)',
        projectTimeline: `2025 - ${year}`,
        outcomeBadge: '100% Operational',
        featured: repo.featured,
        completed: true,
        projectType: 'personal',
        isPrivate: false,
        github: `https://github.com/SahanPramuditha-Dev/${repo.name}`,
        external: repoInfo?.homepage || '',
        tech: languages,
        description: readme || defaultShortDesc,
        role: 'Lead Developer',
        problem: 'Project overview, setup requirements, and engineering decisions.',
        solution: 'Developed a robust codebase, verified unit tests, and pushed operational modules.',
        layoutJson: [
          { id: 'Summary', type: 'Summary', enabled: true },
          { id: 'Story', type: 'Story', enabled: true },
          { id: 'Engineering', type: 'Engineering', enabled: true },
          { id: 'Metrics', type: 'Metrics', enabled: true }
        ],
        screenshots: [],
        techStackJson: languages.map(lang => ({ name: lang, purpose: `Core code implementation language.`, category: 'language' }))
      };

      if (existingIdx !== -1) {
        console.log(`Project with slug "${slug}" already exists. Merging new GitHub details...`);
        const existing = updatedItems[existingIdx];
        // Merge without losing customized CMS fields (like screenshots or custom layout/outcome Badges)
        updatedItems[existingIdx] = {
          ...newProject,
          title: existing.title || newProject.title,
          missionCode: existing.missionCode || newProject.missionCode,
          year: existing.year || newProject.year,
          shortDescription: existing.shortDescription || newProject.shortDescription,
          valueProposition: existing.valueProposition || newProject.valueProposition,
          category: existing.category || newProject.category,
          status: existing.status || newProject.status,
          featured: repo.featured, // force override as per user's current request
          completed: true,
          external: existing.external || newProject.external,
          screenshots: existing.screenshots || [],
          layoutJson: existing.layoutJson || newProject.layoutJson,
          // Always refresh readme from GitHub
          description: readme || existing.description || newProject.description,
          tech: languages.length > 0 ? languages : (existing.tech || []),
          techStackJson: existing.techStackJson && existing.techStackJson.length > 0 ? existing.techStackJson : newProject.techStackJson
        };
      } else {
        console.log(`Adding new project: ${newProject.title}`);
        updatedItems.push(newProject);
      }
    }

    console.log('\nSaving updated projects document in Firestore...');
    await setDoc(docRef, { items: updatedItems });
    console.log('Firestore projects document successfully updated!');

  } catch (error) {
    console.error('Import process failed:', error);
  }
  process.exit();
}

run();
