const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let transporterPromise = null;

const createTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    // Try Resend first (recommended)
    if (process.env.RESEND_API_KEY) {
      return { provider: 'resend', client: new Resend(process.env.RESEND_API_KEY) };
    }

    // Fallback to SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: process.env.SMTP_HOST?.includes('zoho') ? { rejectUnauthorized: false } : undefined,
      });
    }

    return null;
  })();

  return transporterPromise;
};

const sendMail = async ({ to, subject, text, html, replyTo, required = false }) => {
  const transporter = await createTransporter();
  
  if (!transporter) {
    const errorMessage = `Mailer not configured for outbound email: ${subject}`;
    if (required) {
      throw new Error(errorMessage);
    }
    console.warn(errorMessage);
    return { skipped: true };
  }

  // Use Resend
  if (transporter.provider === 'resend') {
    const { data, error } = await transporter.client.emails.send({
      from: process.env.MAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html: html || text,
      text,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // Use SMTP
  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@alphasteplinksaviationschool.com',
    to,
    replyTo,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendMail,
};