const nodemailer = require('nodemailer');

let transporterPromise = null;

const createTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
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

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@alphasteplinksaviationschool.com',
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
