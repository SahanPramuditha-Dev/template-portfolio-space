import React from 'react';

export const renderSimpleMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed === '---') {
      return <hr key={i} className="my-14 border-white/10" />;
    } else if (trimmed.startsWith('# ')) {
      return (
        <h1 key={i} className="mb-10 mt-16 text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 sm:text-4xl">
          {trimmed.replace('# ', '')}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="mb-6 mt-14 border-l-4 border-accent pl-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {trimmed.replace('## ', '')}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="mb-4 mt-10 text-xl font-bold text-white/90">
          {trimmed.replace('### ', '')}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={i} className="mb-3 ml-6 list-disc text-[1.05rem] leading-relaxed text-white/70 marker:text-accent/80 pl-2">
          {trimmed.substring(2)}
        </li>
      );
    } else if (trimmed === '') {
      return <br key={i} />;
    } else {
      return (
        <p key={i} className="mb-7 text-[1.05rem] leading-relaxed text-white/70">
          {line}
        </p>
      );
    }
  });
};
