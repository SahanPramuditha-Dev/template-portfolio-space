export function parseMarkdownSections(markdown) {
  if (!markdown) return {};
  
  const lines = markdown.split('\n');
  const sections = {};
  let currentHeader = 'overview';
  let currentContent = [];

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,4}\s+(.*)$/);
    if (headerMatch) {
      if (currentContent.length > 0) {
        sections[currentHeader] = currentContent.join('\n').trim();
      }
      currentHeader = headerMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  if (currentContent.length > 0) {
    sections[currentHeader] = currentContent.join('\n').trim();
  }
  
  return sections;
}
