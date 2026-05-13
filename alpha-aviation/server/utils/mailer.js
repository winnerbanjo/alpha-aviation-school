const nodemailer = require("nodemailer");

/**
 * Nodemailer transporter using Zoho Mail SMTP (STARTTLS on port 587).
 * Credentials are read from environment variables — never hardcoded.
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

const FROM_ADDRESS = `"Alpha Step Links Aviation School" <${process.env.ZOHO_USER || "support@aslaviationschool.co"}>`;

/**
 * Sends an email via Zoho SMTP (nodemailer).
 * Throws on failure so callers can return a proper 500.
 */
const sendMail = async ({ to, subject, text, html, replyTo }) => {
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    const msg =
      "[mailer] Email not configured: ZOHO_USER or ZOHO_PASS missing from environment.";
    console.error(msg);
    throw new Error(msg);
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    text,
    html,
  };

  if (replyTo) mailOptions.replyTo = replyTo;

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[mailer] Email sent to ${to} | messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[mailer] Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendMail };
