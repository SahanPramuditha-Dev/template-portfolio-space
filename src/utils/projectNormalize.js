/**
 * Normalize CMS project records for the public Projects UI (legacy + new shapes).
 */

export function getImpactMetrics(project) {
  if (!project) return [];
  const raw = project.impactMetrics ?? project.impactMetricsJson;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => {
      if (!m || typeof m !== 'object') return null;
      const label = String(m.label ?? '').trim();
      const value = String(m.value ?? '').trim();
      const suffix = String(m.suffix ?? '').trim();
      if (!label && !value) return null;
      return { label, value, suffix };
    })
    .filter(Boolean);
}

export function normalizeScreenshotEntry(raw) {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const url = raw.trim();
    return url ? { url, caption: '', alt: '' } : null;
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const url = String(raw.url ?? raw.src ?? '').trim();
    if (!url) return null;
    const caption = String(raw.caption ?? '').trim();
    const alt = String(raw.alt ?? '').trim() || caption;
    return { url, caption, alt };
  }
  return null;
}

export function normalizeScreenshotList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeScreenshotEntry).filter(Boolean);
}

export function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url.trim());
}

export function mediaKindForUrl(url) {
  return isVideoUrl(url) ? 'video' : 'image';
}

/**
 * Ordered slides for gallery: optional hero video, thumbnail, then screenshots (deduped by URL).
 */
export function getMediaSlides(project) {
  if (!project) return [];
  const slides = [];

  const push = (url, caption, alt, forceKind) => {
    const u = String(url || '').trim();
    if (!u) return;
    const kind = forceKind || mediaKindForUrl(u);
    slides.push({ url: u, caption: caption || '', alt: alt || '', kind });
  };

  if (project.videoUrl) {
    push(project.videoUrl, project.videoCaption, project.title, 'video');
  }
  if (project.thumbnail) {
    push(project.thumbnail, '', project.title, 'image');
  }
  for (const s of normalizeScreenshotList(project.screenshots)) {
    push(s.url, s.caption, s.alt || s.caption || project.title, mediaKindForUrl(s.url));
  }

  const seen = new Set();
  return slides.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

export function getMediaUrlStrings(project) {
  return getMediaSlides(project).map((s) => s.url);
}

/** Short outcome line for cards: explicit badge, first metric, or truncated outcomes. */
export function getOutcomeBadge(project) {
  if (!project) return '';
  const explicit = String(project.outcomeBadge || '').trim();
  if (explicit) return explicit;
  const metrics = getImpactMetrics(project);
  const first = metrics.find((m) => m.value);
  if (first) {
    const suf = first.suffix ? ` ${first.suffix}` : '';
    if (first.label) return `${first.label}: ${first.value}${suf}`.trim();
    return `${first.value}${suf}`.trim();
  }
  const outcomes = String(project.outcomes || '').trim();
  if (outcomes) {
    return outcomes.length > 52 ? `${outcomes.slice(0, 49)}…` : outcomes;
  }
  return '';
}

export function getCardSubtitle(project) {
  if (!project) return '';
  const role = String(project.role || '').trim();
  const org = String(project.client || project.company || '').trim();
  if (role && org) return `${role} · ${org}`;
  return role || org;
}

const STATUS_LABEL = {
  'In progress': 'In progress',
  Live: 'Live',
  Archived: 'Archived',
};

export function getProjectStatusLabel(project) {
  const s = String(project?.status || '').trim();
  return STATUS_LABEL[s] || (s || null);
}
