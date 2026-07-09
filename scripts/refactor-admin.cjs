const fs = require('fs');
const path = require('path');

const adminPagePath = path.join('src', 'pages', 'AdminPage.jsx');
let content = fs.readFileSync(adminPagePath, 'utf8');

// 1. Extract Constants
const constStart = content.indexOf('const initialSiteContent = {');
const constEnd = content.indexOf('const AdminStatus =');

if (constStart !== -1 && constEnd !== -1) {
    let constantsContent = content.substring(constStart, constEnd);
    
    // Create utils dir
    fs.mkdirSync(path.join('src', 'pages', 'admin', 'utils'), { recursive: true });
    
    // Export all the constants
    let finalConstants = constantsContent.replace(/\nconst /g, '\nexport const ');
    if (finalConstants.startsWith('const ')) {
        finalConstants = 'export ' + finalConstants;
    }
    
    fs.writeFileSync(path.join('src', 'pages', 'admin', 'utils', 'adminConstants.js'), finalConstants);
    
    // Remove from main content
    content = content.substring(0, constStart) + content.substring(constEnd);
    
    // Add import statement at the top (after other imports)
    const importStr = `import {
  initialSiteContent,
  initialExperienceItem,
  getAuthErrorMessage,
  getCmsErrorMessage,
  isLikelyAssetUrl,
  collectMediaValidationErrors,
  initialProject,
  initialCertificate,
  initialSkillGroup,
  initialResource,
  initialBlogPost,
  initialTestimonial,
  initialService,
  initialOpenSource
} from './admin/utils/adminConstants';\n`;
    
    const lastImportIdx = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIdx) + 1;
    content = content.substring(0, endOfLastImport) + importStr + content.substring(endOfLastImport);
    
    fs.writeFileSync(adminPagePath, content);
    console.log('Successfully extracted constants');
} else {
    console.log('Could not find start or end index for constants');
}
