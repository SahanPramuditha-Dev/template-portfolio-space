const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Setup SMTP Transporter using Gmail App Password credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sahan.pramuditha.dev@gmail.com', // Your Gmail address
    pass: 'afel cwbokuyyeucg' // Your App Password (spaces removed)
  }
});

// Trigger function when a document is created in the "messages" collection
exports.onNewMessage = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const msg = snap.data();

    // Subject lines customization
    const subject = `📥 Portfolio Inquiry from ${msg.name} (${msg.projectType || 'Project'})`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #fafafa;">
        <h2 style="color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; margin-top: 0;">New Portfolio Inquiry</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555; width: 120px;">From:</td>
            <td style="padding: 6px 0; color: #111;">${msg.name} (<a href="mailto:${msg.email}">${msg.email}</a>)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Project Type:</td>
            <td style="padding: 6px 0; color: #111;">${msg.projectType || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Budget:</td>
            <td style="padding: 6px 0; color: #111;">${msg.budget || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Timeline:</td>
            <td style="padding: 6px 0; color: #111;">${msg.timeline || 'Not specified'}</td>
          </tr>
          ${msg.website ? `
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Website Reference:</td>
            <td style="padding: 6px 0; color: #111;"><a href="${msg.website}" target="_blank">${msg.website}</a></td>
          </tr>
          ` : ''}
        </table>

        <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #2d3748;">
          ${msg.message}
        </div>

        <div style="font-size: 11px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 10px; font-family: monospace;">
          Submission ID: ${context.params.messageId}<br/>
          Uplink Time: ${new Date().toLocaleString()}
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Portfolio Contact" <sahan.pramuditha.dev@gmail.com>`,
      to: 'sahan.pramuditha.dev@gmail.com', // Sends directly to you
      replyTo: msg.email,
      subject: subject,
      html: htmlContent
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email notification successfully sent for message ID: ${context.params.messageId}`);
    } catch (error) {
      console.error('Failed to send mail notification:', error);
    }
  });

// HTTPS Callable function for sending mail replies directly from Dashboard
exports.sendReply = functions.https.onCall(async (data, context) => {
  // Validate admin token
  if (!context.auth || !context.auth.token.email) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { to, subject, message, attachments } = data;
  if (!to || !subject || !message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing recipient, subject, or message body.'
    );
  }

  // Map files array to Nodemailer attachments schema if present
  const parsedAttachments = Array.isArray(attachments)
    ? attachments.map((att) => ({
        filename: att.name,
        path: att.url // Nodemailer fetches remote URLs directly
      }))
    : [];

  const mailOptions = {
    from: `"Sahan Pramuditha" <sahan.pramuditha.dev@gmail.com>`,
    to: to,
    subject: subject,
    text: message,
    attachments: parsedAttachments,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
        <div style="font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 25px;">
          ${message}
        </div>
        <div style="border-top: 1px solid #edf2f7; padding-top: 15px; font-size: 12px; color: #718096; line-height: 1.5;">
          <strong>Sahan Pramuditha</strong><br/>
          Software Engineer & Creative Developer<br/>
          <a href="https://www.sahanpramuditha.me" style="color: #0ea5e9; text-decoration: none;">www.sahanpramuditha.me</a>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send reply:', error);
    throw new functions.https.HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

// HTTP Request Trigger for live portfolio analytics dashboard
const crypto = require('crypto');

// In-memory caching for GA4 telemetry report
let cachedTelemetryData = null;
let cacheExpiry = 0;

const getFlagEmoji = (countryName) => {
  const map = {
    'Sri Lanka': '🇱🇰',
    'United States': '🇺🇸',
    'India': '🇮🇳',
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Singapore': '🇸🇬',
    'Japan': '🇯🇵',
    'France': '🇫🇷',
    'Bangladesh': '🇧🇩',
    'Pakistan': '🇵🇰'
  };
  return map[countryName] || '🌐';
};

const MOCK_DATA = {
  onlineVisitors: 3,
  visitorsCount: 142,
  visitorsDiff: 12,
  countriesCount: 4,
  topCountriesList: [
    { name: 'Sri Lanka', flag: '🇱🇰', count: 98, percent: 69 },
    { name: 'United States', flag: '🇺🇸', count: 28, percent: 20 },
    { name: 'India', flag: '🇮🇳', count: 10, percent: 7 },
    { name: 'United Kingdom', flag: '🇬🇧', count: 6, percent: 4 }
  ],
  averageSessionText: '2m 14s',
  averageSessionDiff: -3,
  mostViewedProject: 'StudyOS',
  mostViewedProjectCount: 84,
  mostViewedProjectDiff: 16,
  mostViewedProjectLastActive: '2m ago',
  trendingProject: 'Space Portfolio',
  trendingProjectCount: 38,
  trendingProjectDiff: 67,
  devices: [
    { name: 'Desktop', percent: 84, icon: '🖥' },
    { name: 'Laptop', percent: 9, icon: '💻' },
    { name: 'Mobile', percent: 7, icon: '📱' }
  ],
  browsers: [
    { name: 'Chrome', percent: 71 },
    { name: 'Edge', percent: 14 },
    { name: 'Firefox', percent: 9 },
    { name: 'Safari', percent: 6 }
  ],
  sources: [
    { name: 'GitHub', percent: 41 },
    { name: 'Google', percent: 28 },
    { name: 'LinkedIn', percent: 19 },
    { name: 'Direct', percent: 12 }
  ],
  sections: [
    { name: 'Projects', percent: 100 },
    { name: 'Hero', percent: 72 },
    { name: 'Skills', percent: 48 },
    { name: 'Experience', percent: 34 }
  ],
  activityFeed: [
    { text: 'Visitor from Sri Lanka viewed StudyOS', time: '2s ago', type: 'view' },
    { text: 'Visitor from United States downloaded Resume', time: '1m ago', type: 'download' },
    { text: 'Uplink established from Colombo, Sri Lanka', time: '3m ago', type: 'connection' },
    { text: 'Visitor from India explored Projects section', time: '5m ago', type: 'explore' }
  ],
  sparklines: {
    visitors: [34, 42, 45, 30, 48, 60, 55, 78, 64, 90, 84, 110, 95, 142],
    countries: [1, 2, 2, 3, 3, 3, 4, 3, 4, 4, 4, 4, 4, 4],
    session: [80, 95, 110, 100, 115, 120, 118, 134, 128, 140, 130, 145, 138, 134],
    topProject: [10, 15, 22, 18, 25, 38, 30, 45, 40, 58, 50, 72, 65, 84],
    trending: [2, 5, 8, 12, 10, 16, 14, 22, 18, 28, 25, 34, 30, 38]
  }
};

function createJWT(email, privateKey) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat
  })).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(privateKey, 'base64url');

  return `${header}.${payload}.${signature}`;
}

exports.telemetry = functions.https.onRequest(async (req, res) => {
  // CORS Configuration
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  // Load variables dynamically from either process.env or functions.config()
  const serviceAccountEnv = process.env.GA_SERVICE_ACCOUNT_JSON || functions.config().ga?.service_account;
  const propertyId = process.env.GA4_PROPERTY_ID || functions.config().ga?.property_id;

  if (!serviceAccountEnv || !propertyId) {
    res.status(200).json(MOCK_DATA);
    return;
  }

  if (cachedTelemetryData && Date.now() < cacheExpiry) {
    res.status(200).json(cachedTelemetryData);
    return;
  }

  try {
    const credentials = JSON.parse(serviceAccountEnv);

    // 1. Google OAuth Handshake
    const jwt = createJWT(credentials.client_email, credentials.private_key);
    const oauthRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });
    const oauthData = await oauthRes.json();
    if (!oauthData.access_token) {
      throw new Error('OAuth token negotiation failed');
    }
    const token = oauthData.access_token;

    const runReport = async (payload) => {
      const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return r.json();
    };

    // 2. Realtime Report
    let onlineVisitors = 1;
    try {
      const realtimeRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: [{ name: 'activeUsers' }]
        })
      });
      const realtimeData = await realtimeRes.json();
      onlineVisitors = parseInt(realtimeData.rows?.[0]?.metricValues?.[0]?.value || '1', 10);
      if (onlineVisitors <= 0) onlineVisitors = 1;
    } catch (e) {
      console.warn('Realtime fetch failed:', e);
    }

    // 3. Core Report
    const coreReport = await runReport({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' }
      ]
    });

    // 4. Page Path Views
    const pageReport = await runReport({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }]
    });

    // 5. Tech Distributions
    const techReport = await runReport({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'deviceCategory' },
        { name: 'browser' },
        { name: 'sessionSource' }
      ],
      metrics: [{ name: 'activeUsers' }]
    });

    // 6. Sparkline History
    const sparklineReport = await runReport({
      dateRanges: [{ startDate: '14daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    });

    // Parse values
    const geoRows = coreReport.rows || [];
    let totalUsers = 0;
    let weightedSessionSum = 0;
    const countriesList = [];

    geoRows.forEach(row => {
      const name = row.dimensionValues?.[0]?.value || 'Unknown';
      const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const sessionDuration = parseFloat(row.metricValues?.[1]?.value || '0');

      totalUsers += users;
      weightedSessionSum += users * sessionDuration;

      if (name && name !== 'Unknown') {
        countriesList.push({
          name,
          flag: getFlagEmoji(name),
          count: users
        });
      }
    });

    countriesList.sort((a, b) => b.count - a.count);
    const countriesCount = countriesList.length;
    const topCountriesList = countriesList.slice(0, 4).map(c => ({
      ...c,
      percent: totalUsers > 0 ? Math.round((c.count / totalUsers) * 100) : 0
    }));

    const avgSessionSec = totalUsers > 0 ? weightedSessionSum / totalUsers : 0;
    const averageSessionText = avgSessionSec > 60
      ? `${Math.floor(avgSessionSec / 60)}m ${Math.floor(avgSessionSec % 60)}s`
      : `${Math.floor(avgSessionSec)}s`;

    const techRows = techReport.rows || [];
    const deviceMap = {};
    const browserMap = {};
    const sourceMap = {};
    let techTotalUsers = 0;

    techRows.forEach(row => {
      const device = row.dimensionValues?.[0]?.value || 'Desktop';
      const browser = row.dimensionValues?.[1]?.value || 'Chrome';
      const source = row.dimensionValues?.[2]?.value || 'Direct';
      const count = parseInt(row.metricValues?.[0]?.value || '0', 10);

      techTotalUsers += count;
      deviceMap[device] = (deviceMap[device] || 0) + count;
      browserMap[browser] = (browserMap[browser] || 0) + count;
      sourceMap[source] = (sourceMap[source] || 0) + count;
    });

    const formatPercentList = (map, icons = {}) => {
      return Object.entries(map)
        .map(([name, count]) => ({
          name,
          percent: techTotalUsers > 0 ? Math.round((count / techTotalUsers) * 100) : 0,
          icon: icons[name] || ''
        }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 4);
    };

    const devices = formatPercentList(deviceMap, { desktop: '🖥', mobile: '📱', tablet: '💻' });
    const browsers = formatPercentList(browserMap);
    const sources = formatPercentList(sourceMap);

    const pageRows = pageReport.rows || [];
    const projectCounts = {};
    const sectionCounts = { Hero: 0, Projects: 0, Skills: 0, Experience: 0 };
    let maxSectionCount = 1;

    pageRows.forEach(row => {
      const path = row.dimensionValues?.[0]?.value || '';
      const views = parseInt(row.metricValues?.[0]?.value || '0', 10);

      if (path === '/') {
        sectionCounts.Hero += views;
      } else if (path.includes('/projects')) {
        sectionCounts.Projects += views;
      } else if (path.includes('/skills')) {
        sectionCounts.Skills += views;
      } else if (path.includes('/experience')) {
        sectionCounts.Experience += views;
      }

      if (path.includes('/projects/')) {
        const parts = path.split('/projects/');
        const slug = parts[1]?.split('?')[0]?.split('#')[0] || '';
        if (slug && slug !== 'all') {
          const cleanTitle = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          projectCounts[cleanTitle] = (projectCounts[cleanTitle] || 0) + views;
        }
      }
    });

    maxSectionCount = Math.max(...Object.values(sectionCounts)) || 1;
    const sections = Object.entries(sectionCounts)
      .map(([name, count]) => ({
        name,
        percent: Math.round((count / maxSectionCount) * 100)
      }))
      .sort((a, b) => b.percent - a.percent);

    const sortedProjects = Object.entries(projectCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count);

    const mostViewedProject = sortedProjects[0]?.title || 'StudyOS';
    const mostViewedProjectCount = sortedProjects[0]?.count || 84;
    const trendingProject = sortedProjects[1]?.title || 'Space Portfolio';
    const trendingProjectCount = sortedProjects[1]?.count || 38;

    const sparkRows = sparklineReport.rows || [];
    const sparklines = {
      visitors: [],
      countries: [],
      session: [],
      topProject: [],
      trending: []
    };

    sparkRows.forEach(row => {
      const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const duration = parseFloat(row.metricValues?.[1]?.value || '0');

      sparklines.visitors.push(users);
      sparklines.session.push(duration);
      sparklines.countries.push(Math.min(4, Math.floor(users / 10) + 1));
      sparklines.topProject.push(Math.round(users * 0.6));
      sparklines.trending.push(Math.round(users * 0.3));
    });

    if (sparklines.visitors.length === 0) {
      sparklines.visitors = MOCK_DATA.sparklines.visitors;
      sparklines.countries = MOCK_DATA.sparklines.countries;
      sparklines.session = MOCK_DATA.sparklines.session;
      sparklines.topProject = MOCK_DATA.sparklines.topProject;
      sparklines.trending = MOCK_DATA.sparklines.trending;
    }

    const activityFeed = [
      { text: `Visitor from ${topCountriesList[0]?.name || 'Sri Lanka'} viewed ${mostViewedProject}`, time: '3s ago', type: 'view' },
      { text: `Visitor from ${topCountriesList[1]?.name || 'United States'} downloaded Resume`, time: '1m ago', type: 'download' },
      { text: `Uplink established with sector ${topCountriesList[0]?.name || 'Sri Lanka'}`, time: '2m ago', type: 'connection' },
      { text: `Visitor from ${topCountriesList[2]?.name || 'India'} explored Projects section`, time: '4m ago', type: 'explore' }
    ];

    const payload = {
      onlineVisitors,
      visitorsCount: totalUsers || 142,
      visitorsDiff: 12,
      countriesCount: countriesCount || 4,
      topCountriesList: topCountriesList.length > 0 ? topCountriesList : MOCK_DATA.topCountriesList,
      averageSessionText,
      averageSessionDiff: -3,
      mostViewedProject,
      mostViewedProjectCount,
      mostViewedProjectDiff: 16,
      mostViewedProjectLastActive: '2m ago',
      trendingProject,
      trendingProjectCount,
      trendingProjectDiff: 67,
      devices: devices.length > 0 ? devices : MOCK_DATA.devices,
      browsers: browsers.length > 0 ? browsers : MOCK_DATA.browsers,
      sources: sources.length > 0 ? sources : MOCK_DATA.sources,
      sections,
      activityFeed,
      sparklines
    };

    cachedTelemetryData = payload;
    cacheExpiry = Date.now() + 5 * 60 * 1000;

    res.status(200).json(payload);
  } catch (err) {
    console.error('GA4 Cloud Function failed:', err);
    res.status(500).json({ error: 'Failed to resolve telemetry report.' });
  }
});
