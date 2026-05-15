const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const DEFAULT_FROM_EMAIL =
  process.env.MAIL_FROM ||
  process.env.ZOHO_USER ||
  "support@aslaviationschool.co";
const FROM_ADDRESS = `"Alpha Step Links Aviation School" <${DEFAULT_FROM_EMAIL}>`;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const createZohoTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

const sendViaResend = async ({ to, subject, text, html, replyTo }) => {
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(`[mailer] Resend rejected the email: ${error.message}`);
  }

  console.log(`[mailer] Email sent via Resend to ${to} | id: ${data.id}`);
  return data;
};

const sendViaZoho = async ({ to, subject, text, html, replyTo }) => {
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    const msg =
      "[mailer] Zoho fallback unavailable: ZOHO_USER or ZOHO_PASS missing from environment.";
    console.error(msg);
    throw new Error(msg);
  }

  const transporter = createZohoTransporter();
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    text,
    html,
  };

  if (replyTo) mailOptions.replyTo = replyTo;

  const info = await transporter.sendMail(mailOptions);
  console.log(
    `[mailer] Email sent via Zoho SMTP to ${to} | messageId: ${info.messageId}`,
  );
  return info;
};

const sendMail = async ({ to, subject, text, html, replyTo }) => {
  try {
    if (resend) {
      return await sendViaResend({ to, subject, text, html, replyTo });
    }

    return await sendViaZoho({ to, subject, text, html, replyTo });
  } catch (err) {
    console.error(`[mailer] Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendMail, FROM_ADDRESS };
