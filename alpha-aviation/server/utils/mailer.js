const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
  });
};

const sendMail = async ({ to, subject, text, html, replyTo }) => {
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    console.warn("Email not configured: ZOHO_USER or ZOHO_PASS missing.");
    return { skipped: true };
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: `"Alpha Step Links Aviation School" <${process.env.ZOHO_USER}>`,
    to,
    replyTo,
    subject,
    text,
    html,
  });
};

module.exports = { sendMail };
