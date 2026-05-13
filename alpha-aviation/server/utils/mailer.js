const { Resend } = require("resend");

// Lazy-initialized — client is only created when sendMail() is actually called.
// This prevents a startup crash when RESEND_API_KEY is absent (e.g. MODE=production
// where enrollment OTP emails are disabled).
let _resend = null;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    const msg =
      "[mailer] Email not configured: RESEND_API_KEY missing from environment.";
    console.error(msg);
    throw new Error(msg);
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

const FROM_ADDRESS = `"Alpha Step Links Aviation School" <support@aslaviationschool.co>`;

/**
 * Sends an email via Resend API (HTTPS — works on all cloud hosts including Render).
 * Throws on failure so callers can return a proper 500.
 */
const sendMail = async ({ to, subject, text, html, replyTo }) => {
  const resend = getResendClient();

  try {
    const payload = {
      from: FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    };

    if (replyTo) payload.replyTo = replyTo;

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error(`[mailer] Resend API error sending to ${to}:`, error);
      throw new Error(error.message || "Email send failed");
    }

    console.log(`[mailer] Email sent to ${to} | id: ${data.id}`);
    return data;
  } catch (err) {
    console.error(`[mailer] Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendMail };
