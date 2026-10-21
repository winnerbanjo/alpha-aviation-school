const Notification = require("../models/Notification");
const { sendMail } = require("./mailer");
const {
  TYPE_LABELS,
  formatLongDate,
  formatVerificationCode,
  verifyUrlFor,
} = require("./certificateService");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const certificateEmailHtml = (cert) => {
  const url = verifyUrlFor(cert.verificationCode);
  const programmes = cert.programmes.map((p) => `<li style="margin: 0 0 4px 0;">${escapeHtml(p)}</li>`).join("");
  return `
  <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #F5F7FB; padding: 40px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #DCE2EB;">
      <tr>
        <td align="center" style="background-color: #07152E; padding: 36px 24px; border-bottom: 3px solid #AA8546;">
          <p style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Alpha Step Links</p>
          <p style="color: #8EAEFF; margin: 8px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px;">Aviation School</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 36px 40px 12px 40px;">
          <p style="color: #AA8546; margin: 0 0 10px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px;">${escapeHtml(TYPE_LABELS[cert.type])}</p>
          <h1 style="color: #10264B; margin: 0 0 18px 0; font-size: 24px; line-height: 1.3;">Congratulations, ${escapeHtml(cert.recipient.fullName)}</h1>
          <p style="color: #53647C; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Your certificate has been issued by Alpha Step Links Aviation School for:</p>
          <ul style="color: #172B49; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; padding-left: 20px; font-weight: 600;">${programmes}</ul>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F7FB; border-radius: 12px; border: 1px solid #DCE2EB;">
            <tr>
              <td style="padding: 16px 20px; font-size: 13px; color: #53647C; line-height: 1.9;">
                Certificate ID: <strong style="color: #10264B;">${escapeHtml(cert.serial)}</strong><br/>
                Date of completion: <strong style="color: #10264B;">${escapeHtml(formatLongDate(cert.completionDate))}</strong><br/>
                Verification code: <strong style="color: #10264B; font-family: 'SFMono-Regular', Consolas, monospace;">${escapeHtml(formatVerificationCode(cert.verificationCode))}</strong>
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin: 28px 0 8px 0;">
            <a href="${url}" style="background-color: #1246C8; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px; display: inline-block;">View &amp; download certificate</a>
          </div>
          <p style="color: #8C9AB0; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">Employers and institutions can confirm this certificate at any time by scanning its QR code or visiting<br/><a href="${url}" style="color: #1246C8;">${escapeHtml(url)}</a></p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #F5F7FB; padding: 22px; text-align: center; border-top: 1px solid #DCE2EB;">
          <p style="color: #53647C; font-size: 12px; margin: 0;">Skills Today. Global Opportunities Tomorrow.</p>
          <p style="color: #8C9AB0; font-size: 12px; margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>`;
};

const certificateEmailText = (cert) =>
  [
    `Congratulations, ${cert.recipient.fullName}.`,
    "",
    `Your ${TYPE_LABELS[cert.type]} has been issued by Alpha Step Links Aviation School for:`,
    ...cert.programmes.map((p) => `  • ${p}`),
    "",
    `Certificate ID: ${cert.serial}`,
    `Date of completion: ${formatLongDate(cert.completionDate)}`,
    `Verification code: ${formatVerificationCode(cert.verificationCode)}`,
    "",
    `View, download or verify your certificate: ${verifyUrlFor(cert.verificationCode)}`,
  ].join("\n");

/** Emails the certificate link. Resolves to "sent" or "failed"; never throws. */
const emailCertificate = async (cert) => {
  if (!cert.recipient?.email) return "failed";
  try {
    await sendMail({
      to: cert.recipient.email,
      subject: `Your ${TYPE_LABELS[cert.type]} — Alpha Step Links Aviation School`,
      text: certificateEmailText(cert),
      html: certificateEmailHtml(cert),
    });
    return "sent";
  } catch (error) {
    console.error(`[certificates] email for ${cert.serial} failed:`, error.message);
    return "failed";
  }
};

/** In-app notification for a linked student account. Never throws. */
const notifyLinkedStudent = async (cert) => {
  const studentId = cert.recipient?.student?._id || cert.recipient?.student;
  if (!studentId) return;
  await Notification.create({
    user: studentId,
    type: "certificate_issued",
    title: "Your certificate is ready",
    message: `${TYPE_LABELS[cert.type]} ${cert.serial} has been issued. You can view and download it from your Certificate page.`,
    metadata: { certificateId: String(cert._id), serial: cert.serial },
  }).catch((error) => {
    console.error("[certificates] student notification failed:", error.message);
  });
};

module.exports = { emailCertificate, notifyLinkedStudent };
