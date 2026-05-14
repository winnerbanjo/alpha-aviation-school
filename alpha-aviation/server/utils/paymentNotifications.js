const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendMail } = require("./mailer");

const clientUrl = () =>
  process.env.CLIENT_URL || "https://www.aslaviationschool.co";

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

const studentName = (student) =>
  `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";

const baseHtml = ({ title, body, ctaText, ctaUrl }) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <tr>
        <td align="center" style="background-color: #020617; padding: 36px 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Alpha Step Links</h1>
          <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 36px 40px;">
          <h2 style="color: #0f172a; margin: 0 0 18px 0; font-size: 20px;">${title}</h2>
          <div style="color: #475569; font-size: 15px; line-height: 1.7;">${body}</div>
          ${
            ctaText && ctaUrl
              ? `<div style="text-align: center; margin-top: 28px;"><a href="${ctaUrl}" style="background-color: #0061FF; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">${ctaText}</a></div>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 13px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
`;

const safeSendMail = async (mailOptions, label) => {
  try {
    await sendMail(mailOptions);
  } catch (error) {
    console.error(`[payment-notifications] ${label} failed:`, error.message);
  }
};

const getAdmins = async () => User.find({ role: "admin" }).select("_id email");

const notifyAdmins = async ({ title, message, emailSubject, emailText, emailHtml }) => {
  const admins = await getAdmins();
  const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

  if (admins.length > 0) {
    await Notification.insertMany(
      admins.map((admin) => ({
        user: admin._id,
        type: "general",
        title,
        message,
      })),
      { ordered: false },
    ).catch((error) => {
      console.error("[payment-notifications] admin notifications failed:", error.message);
    });
  }

  await Promise.all(
    adminEmails.map((to) =>
      safeSendMail(
        {
          to,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        },
        `admin email to ${to}`,
      ),
    ),
  );
};

const notifyStudent = async ({ student, type, title, message, metadata, emailSubject, emailText, emailHtml }) => {
  await Notification.create({
    user: student._id,
    type,
    title,
    message,
    metadata: metadata || {},
  }).catch((error) => {
    console.error("[payment-notifications] student notification failed:", error.message);
  });

  if (student.email) {
    await safeSendMail(
      {
        to: student.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      },
      `student email to ${student.email}`,
    );
  }
};

const notifyReceiptUploaded = async ({ student, payment }) => {
  const amount = payment?.amount || student.amountDue || student.totalCoursePrice || 0;
  const reference = payment?.reference || `INV-${new Date().getFullYear()}-${student.studentIdNumber || student._id.toString().slice(-4)}`;
  const dashboardUrl = `${clientUrl()}/dashboard/payments`;
  const adminUrl = `${clientUrl()}/admin/payments`;

  await notifyStudent({
    student,
    type: "payment_submitted",
    title: "Payment receipt submitted",
    message: `Your receipt for ${formatNaira(amount)} has been submitted and is under review.`,
    metadata: { paymentId: payment?._id, amount, reference },
    emailSubject: "Payment Receipt Received — Alpha Step Links Aviation School",
    emailText: `Hello ${studentName(student)},\n\nWe received your payment receipt for ${formatNaira(amount)}. Your payment is now under review.\n\nYou can track the status from your dashboard: ${dashboardUrl}`,
    emailHtml: baseHtml({
      title: "Payment Receipt Received",
      body: `<p>Hello ${studentName(student)},</p><p>We received your payment receipt for <strong>${formatNaira(amount)}</strong>. Your payment is now under review.</p><p>Reference: <strong>${reference}</strong></p>`,
      ctaText: "View Payment Status",
      ctaUrl: dashboardUrl,
    }),
  });

  await notifyAdmins({
    title: "New payment receipt uploaded",
    message: `${studentName(student)} uploaded a payment receipt for ${formatNaira(amount)}.`,
    emailSubject: `New Payment Receipt — ${studentName(student)}`,
    emailText: `A new payment receipt has been uploaded by ${studentName(student)} (${student.email}).\n\nAmount: ${formatNaira(amount)}\nReference: ${reference}\n\nReview it in your dashboard: ${adminUrl}`,
    emailHtml: baseHtml({
      title: "New Payment Receipt Uploaded",
      body: `<p>A student has uploaded a payment receipt that needs review.</p><p><strong>Student:</strong> ${studentName(student)}<br/><strong>Email:</strong> ${student.email}<br/><strong>Amount:</strong> ${formatNaira(amount)}<br/><strong>Reference:</strong> ${reference}</p>`,
      ctaText: "Review Payment",
      ctaUrl: adminUrl,
    }),
  });
};

const notifyPaymentConfirmed = async ({ student, payment, source = "Payment" }) => {
  const amount = payment?.amount || student.amountPaid || 0;
  const dashboardUrl = `${clientUrl()}/dashboard/resources`;

  await notifyStudent({
    student,
    type: "payment_confirmed",
    title: "Payment confirmed",
    message: `Your ${source.toLowerCase()} payment of ${formatNaira(amount)} has been confirmed. Your resources are now unlocked.`,
    metadata: {
      paymentId: payment?._id,
      amount,
      amountDue: student.amountDue,
      amountPaid: student.amountPaid,
      source,
    },
    emailSubject: "Payment Confirmed — Alpha Step Links Aviation School",
    emailText: `Hello ${studentName(student)},\n\nYour payment of ${formatNaira(amount)} has been confirmed. Your course materials are now unlocked.\n\nAccess your resources: ${dashboardUrl}`,
    emailHtml: baseHtml({
      title: "Payment Confirmed",
      body: `<p>Hello ${studentName(student)},</p><p>Your payment of <strong>${formatNaira(amount)}</strong> has been confirmed.</p><p>Your course materials and resources are now unlocked.</p>`,
      ctaText: "Access Resources",
      ctaUrl: dashboardUrl,
    }),
  });

  await notifyAdmins({
    title: "Payment confirmed",
    message: `${studentName(student)} has a confirmed ${source.toLowerCase()} payment of ${formatNaira(amount)}.`,
    emailSubject: `Payment Confirmed — ${studentName(student)}`,
    emailText: `Payment confirmed for ${studentName(student)} (${student.email}).\n\nAmount: ${formatNaira(amount)}\nSource: ${source}`,
    emailHtml: baseHtml({
      title: "Payment Confirmed",
      body: `<p>Payment has been confirmed for <strong>${studentName(student)}</strong>.</p><p><strong>Email:</strong> ${student.email}<br/><strong>Amount:</strong> ${formatNaira(amount)}<br/><strong>Source:</strong> ${source}</p>`,
      ctaText: "View Students",
      ctaUrl: `${clientUrl()}/admin/students`,
    }),
  });
};

const notifyPaymentRejected = async ({ student, payment, reason }) => {
  const dashboardUrl = `${clientUrl()}/dashboard/payments`;

  await notifyStudent({
    student,
    type: "payment_rejected",
    title: "Payment receipt rejected",
    message: `Your payment receipt could not be verified. Reason: ${reason}`,
    metadata: {
      paymentId: payment?._id,
      reason,
    },
    emailSubject: "Payment Review Update — Alpha Step Links Aviation School",
    emailText: `Hello ${studentName(student)},\n\nYour payment receipt could not be verified.\n\nReason: ${reason}\n\nPlease upload a new receipt in your dashboard: ${dashboardUrl}`,
    emailHtml: baseHtml({
      title: "Action Required",
      body: `<p>Hello ${studentName(student)},</p><p>Your uploaded payment receipt could not be verified. Please review the reason below and upload a new receipt.</p><div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-top: 16px;"><strong style="color: #dc2626;">Reason:</strong><p style="color: #991b1b; margin: 8px 0 0 0;">${reason}</p></div>`,
      ctaText: "Upload New Receipt",
      ctaUrl: dashboardUrl,
    }),
  });

  await notifyAdmins({
    title: "Payment receipt rejected",
    message: `${studentName(student)}'s payment receipt was rejected. Reason: ${reason}`,
    emailSubject: `Payment Receipt Rejected — ${studentName(student)}`,
    emailText: `Payment receipt rejected for ${studentName(student)} (${student.email}).\n\nReason: ${reason}`,
    emailHtml: baseHtml({
      title: "Payment Receipt Rejected",
      body: `<p>A payment receipt was rejected for <strong>${studentName(student)}</strong>.</p><p><strong>Email:</strong> ${student.email}</p><p><strong>Reason:</strong> ${reason}</p>`,
      ctaText: "View Payments",
      ctaUrl: `${clientUrl()}/admin/payments`,
    }),
  });
};

module.exports = {
  notifyReceiptUploaded,
  notifyPaymentConfirmed,
  notifyPaymentRejected,
};
