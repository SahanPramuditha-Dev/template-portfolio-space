const functions = require('firebase-functions');
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
