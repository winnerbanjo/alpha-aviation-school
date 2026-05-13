const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false, // STARTTLS — do NOT use 465 on cloud hosts
  requireTLS: true,
  auth: {
    user: process.env.ZOHO_USER,
    pass: process.env.ZOHO_PASS,
  },
});

const sendMail = async ({ to, subject, text, html, replyTo }) => {
  if (!process.env.ZOHO_USER || !process.env.ZOHO_PASS) {
    const msg =
      "Email not configured: ZOHO_USER or ZOHO_PASS is missing from environment.";
    console.error(msg);
    throw new Error(msg);
  }

  const mailOptions = {
    from: `"Alpha Step Links Aviation School" <${process.env.ZOHO_USER}>`,
    to,
    subject,
    text,
    html,
  };

  if (replyTo) mailOptions.replyTo = replyTo;

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(
      `[mailer] Email sent to ${to} | messageId: ${result.messageId}`,
    );
    return result;
  } catch (err) {
    // Log the full error so Render's log shows exactly what Zoho rejected
    console.error(`[mailer] SMTP error sending to ${to}:`);
    console.error(`  code   : ${err.code}`);
    console.error(`  command: ${err.command}`);
    console.error(`  message: ${err.message}`);
    throw err;
  }
};

module.exports = { sendMail };
