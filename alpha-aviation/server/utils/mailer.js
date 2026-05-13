const nodemailer = require("nodemailer");

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false, 
    requireTLS: true,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    debug: true,
    logger: true
  });
  return transporter;
};

const sendMail = async ({ to, subject, text, html, replyTo }) => {
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    console.warn("Email not configured: ZOHO_USER or ZOHO_PASS missing.");
    return { skipped: true };
  }

  const transporter = createTransporter();

  try {
    const result = await transporter.sendMail({
      from: `"Alpha Step Links Aviation School" <${process.env.ZOHO_USER}>`,
      to,
      replyTo,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error(
      `Email failed to ${to}: [${error.code || "ERR"}] ${error.message}`,
    );
    throw error;
  }
};

module.exports = { sendMail };
