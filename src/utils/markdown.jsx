import React from 'react';

export const renderSimpleMarkdown = (text) => {
  if (!text) return null;

  const codeBlocks = [];
  let processedText = text.replace(/```([\s\S]*?)```/g, (match, code) => {
    codeBlocks.push(code.trim());
    return `\n__CODE_BLOCK_${codeBlocks.length - 1}__\n`;
  });

  const parseInline = (str) => {
    if (typeof str !== 'string') return str;
    const escapeHtml = (value) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const safeText = escapeHtml(str);
    let html = safeText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
      .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-medium text-accent hover:underline">$1</a>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return processedText.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('__CODE_BLOCK_')) {
      const index = parseInt(trimmed.match(/\d+/)[0]);
      return (
        <div key={i} className="my-8 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl">
          <div className="flex items-center px-4 py-3 border-b border-white/10 bg-black/40">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="ml-4 text-xs font-mono text-white/40 tracking-widest uppercase">Terminal</div>
          </div>
          <div className="p-5 overflow-x-auto">
            <pre className="font-mono text-[13px] leading-relaxed text-blue-300">
              <code>{codeBlocks[index]}</code>
            </pre>
          </div>
        </div>
      );
    } else if (trimmed === '---') {
      return <hr key={i} className="my-14 border-white/10" />;
    } else if (trimmed.startsWith('# ')) {
      return (
        <h1 key={i} className="mb-10 mt-16 text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 sm:text-4xl">
          {parseInline(trimmed.replace('# ', ''))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="mb-6 mt-14 border-l-4 border-accent pl-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {parseInline(trimmed.replace('## ', ''))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="mb-4 mt-10 text-xl font-bold text-white/90">
          {parseInline(trimmed.replace('### ', ''))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={i} className="mb-3 ml-6 list-disc text-[1.05rem] leading-relaxed text-white/70 marker:text-accent/80 pl-2">
          {parseInline(trimmed.substring(2))}
        </li>
      );
    } else if (trimmed === '') {
      return <br key={i} />;
    } else {
      return (
        <p key={i} className="mb-7 text-[1.05rem] leading-relaxed text-white/70">
          {parseInline(line)}
        </p>
      );
    }
  });
};
