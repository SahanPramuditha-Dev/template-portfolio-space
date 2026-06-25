/* global process */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MESSAGE_MAX_LENGTH = 2000;
const rateLimitBucket = new Map();

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const clean = (value, max = 500) => String(value || '').trim().slice(0, max);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getClientIp = (req) =>
  clean(req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown', 120);

const isRateLimited = (ip) => {
  const now = Date.now();
  const current = rateLimitBucket.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (current.resetAt <= now) {
    rateLimitBucket.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  rateLimitBucket.set(ip, current);
  return current.count > RATE_LIMIT_MAX;
};

const verifyTurnstile = async (token, ip) => {
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const form = new URLSearchParams();
  form.append('secret', process.env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  form.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const result = await response.json();
  return Boolean(result.success);
};

const forwardMessage = async (payload) => {
  const endpoint =
    process.env.CONTACT_FORWARD_ENDPOINT ||
    (process.env.FORMSPREE_ID ? `https://formspree.io/f/${process.env.FORMSPREE_ID}` : '');

  if (!endpoint) {
    return { configured: false };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return { configured: true, ok: response.ok };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    json(res, 429, { error: 'Too many messages. Please try again shortly.' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    json(res, 400, { error: 'Invalid JSON payload.' });
    return;
  }

  if (clean(body.website)) {
    json(res, 202, { ok: true });
    return;
  }

  const payload = {
    name: clean(body.name, 100),
    email: clean(body.email, 200),
    projectType: clean(body.projectType, 80),
    budget: clean(body.budget, 80),
    timeline: clean(body.timeline, 80),
    message: clean(body.message, MESSAGE_MAX_LENGTH),
    source: 'portfolio-contact',
    receivedAt: new Date().toISOString(),
  };

  if (payload.name.length < 2 || !isValidEmail(payload.email) || payload.message.length < 10) {
    json(res, 400, { error: 'Please check the required fields.' });
    return;
  }

  const turnstileOk = await verifyTurnstile(clean(body.turnstileToken, 2048), ip);
  if (!turnstileOk) {
    json(res, 403, { error: 'Human verification failed.' });
    return;
  }

  const forward = await forwardMessage({
    ...payload,
    _replyto: payload.email,
    _subject: 'New message from portfolio contact form',
  });

  if (!forward.configured) {
    json(res, 503, { error: 'Contact delivery is not configured.' });
    return;
  }

  if (!forward.ok) {
    json(res, 502, { error: 'Contact delivery failed.' });
    return;
  }

  json(res, 200, { ok: true });
}
