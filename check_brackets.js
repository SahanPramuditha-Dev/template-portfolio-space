const fs = require('fs');

const content = fs.readFileSync('src/pages/ProjectPage.jsx', 'utf8');
let openBraces = 0;
let openParens = 0;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  // Simple tracking (ignores strings/comments for a rough check)
  if (char === '{') openBraces++;
  if (char === '}') openBraces--;
  if (char === '(') openParens++;
  if (char === ')') openParens--;
}

console.log('Braces:', openBraces, 'Parens:', openParens);
