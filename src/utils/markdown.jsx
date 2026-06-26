import React from 'react';

export const renderSimpleMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed === '---') {
      return <hr key={i} className="my-10 border-white/10" />;
    } else if (trimmed.startsWith('# ')) {
      return <h1 key={i} className="text-3xl font-bold text-text mb-6 mt-10">{trimmed.replace('# ', '')}</h1>;
    } else if (trimmed.startsWith('## ')) {
      return <h2 key={i} className="text-2xl font-bold text-text mb-4 mt-8">{trimmed.replace('## ', '')}</h2>;
    } else if (trimmed.startsWith('### ')) {
      return <h3 key={i} className="text-xl font-bold text-text mb-3 mt-6">{trimmed.replace('### ', '')}</h3>;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return <li key={i} className="ml-5 list-disc mb-2 text-text-muted leading-relaxed pl-1">{trimmed.substring(2)}</li>;
    } else if (trimmed === '') {
      return <br key={i} />;
    } else {
      return <p key={i} className="mb-6 text-text-muted leading-relaxed text-[1.05rem]">{line}</p>;
    }
  });
};
