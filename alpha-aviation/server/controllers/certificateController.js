const crypto = require("crypto");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const {
  TEMPLATE_VERSION,
  DEFAULT_SIGNATORIES,
  CERTIFICATE_TYPES,
  STATUSES,
  TYPE_LABELS,
  DELIVERY_LABELS,
  LIMITS,
  SERIAL_PATTERN,
  cleanText,
  nameKeyFor,
  escapeRegex,
  toIsoDate,
  parseDateOnly,
  validateCertificateInput,
  validateReason,
  generateVerificationCode,
  normalizeVerificationCode,
  normalizeSerial,
  nextSerial,
  signCertificate,
  checkIntegrity,
  auditEvent,
  pushEvent,
  toAdminDTO,
  toPublicDTO,
} = require("../utils/certificateService");
const { emailCertificate, notifyLinkedStudent } = require("../utils/certificateNotifications");

const ADMIN_POPULATE = [
  { path: "issuedBy", select: "firstName lastName email" },
  { path: "revocation.by", select: "firstName lastName email" },
  { path: "supersedes", select: "serial" },
  { path: "supersededBy", select: "serial" },
  { path: "events.actor", select: "firstName lastName email" },
];

const dbUnavailable = (res) =>
  res.status(503).json({
    success: false,
    message: "Database unavailable. Demo mode is disabled for certificate actions.",
  });

const validationFailed = (res, errors) =>
  res.status(400).json({
    success: false,
    code: "VALIDATION_FAILED",
    message: Object.values(errors)[0] || "Invalid certificate details",
    errors,
  });

const readIdempotencyKey = (req) => {
  const key = cleanText(req.get("Idempotency-Key") || req.body?.idempotencyKey || "");
  return key ? key.slice(0, 100) : undefined;
};

const programmeOverlap = (a, b) => {
  const set = new Set(a.map((p) => p.toLowerCase()));
  return b.some((p) => set.has(p.toLowerCase()));
};

/** Active certificates of the same type for the same person that share a programme. */
const findDuplicates = async ({ nameKey, studentId, type, programmes, excludeId }) => {
  const or = [{ "recipient.nameKey": nameKey }];
  if (studentId) or.push({ "recipient.student": studentId });
  const query = { status: "active", type, $or: or };
  if (excludeId) query._id = { $ne: excludeId };
  const candidates = await Certificate.find(query)
    .select("serial recipient.fullName programmes completionDate issueDate")
    .limit(20)
    .lean();
  return candidates
    .filter((c) => programmeOverlap(c.programmes, programmes))
    .map((c) => ({
      id: String(c._id),
      serial: c.serial,
      fullName: c.recipient.fullName,
      programmes: c.programmes,
      completionDate: toIsoDate(c.completionDate),
      issueDate: c.issueDate,
    }));
};

/**
 * Links a recipient to a student account: by explicit id, otherwise by matching
 * email. Returns { student } or { error } for an explicit id that is not a student.
 */
const resolveStudent = async ({ studentId, email }) => {
  if (studentId) {
    if (!/^[a-f\d]{24}$/i.test(String(studentId))) return { error: "Linked student not found" };
    const student = await User.findById(studentId).select("email role studentIdNumber");
    if (!student || student.role !== "student") return { error: "Linked student not found" };
    return { student };
  }
  if (email) {
    const student = await User.findOne({ email, role: "student" }).select(
      "email role studentIdNumber",
    );
    return { student: student || null };
  }
  return { student: null };
};

/** Builds, signs and stores a certificate. Retries the astronomically unlikely code collision. */
const createCertificate = async ({
  value,
  student,
  user,
  batchId,
  idempotencyKey,
  supersedes,
  reissueReason,
  eventType = "issued",
}) => {
  const issueDate = new Date();
  const serial = await nextSerial(issueDate);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const doc = new Certificate({
      serial,
      verificationCode: generateVerificationCode(),
      type: value.type,
      recipient: {
        fullName: value.fullName,
        nameKey: nameKeyFor(value.fullName),
        email: value.email || student?.email || undefined,
        student: student?._id || null,
        studentIdNumber: student?.studentIdNumber || undefined,
      },
      programmes: value.programmes,
      completionDate: value.completionDate,
      issueDate,
      deliveryMode: value.deliveryMode,
      signatories: DEFAULT_SIGNATORIES,
      templateVersion: TEMPLATE_VERSION,
      supersedes: supersedes || null,
      reissueReason: reissueReason || undefined,
      batchId: batchId || undefined,
      idempotencyKey: idempotencyKey || undefined,
      issuedBy: user?.userId || null,
      events: [
        auditEvent(eventType, user, {
          ...(batchId ? { batchId } : {}),
          ...(reissueReason ? { reason: reissueReason } : {}),
        }),
      ],
    });
    Object.assign(doc, signCertificate(doc));
    try {
      return await doc.save();
    } catch (error) {
      const collided = error?.code === 11000 && error?.keyPattern?.verificationCode;
      if (!collided || attempt === 2) throw error;
    }
  }
  return null;
};

/** Emails the certificate link and records the outcome. Returns "sent" | "failed". */
const deliverEmail = async (cert, user) => {
  if (!cert.recipient.email) return "failed";
  const emailStatus = await emailCertificate(cert);
  await Certificate.updateOne(
    { _id: cert._id },
    {
      $set: {
        "delivery.emailStatus": emailStatus,
        "delivery.emailedAt": emailStatus === "sent" ? new Date() : null,
      },
      $push: pushEvent(
        auditEvent(emailStatus === "sent" ? "emailed" : "email_failed", user, {
          to: cert.recipient.email,
        }),
      ),
    },
  );
  return emailStatus;
};

/** Optional side effects after issuing. Returns the email outcome. */
const afterIssue = async (cert, { notifyRecipient, markGraduated }, user) => {
  if (markGraduated && cert.recipient.student) {
    await User.updateOne(
      { _id: cert.recipient.student, role: "student" },
      { $set: { status: "graduated" } },
    );
  }
  if (cert.recipient.student) await notifyLinkedStudent(cert);
  return notifyRecipient ? deliverEmail(cert, user) : "not_requested";
};

const loadAdminDTO = async (id, options) => {
  const cert = await Certificate.findById(id).populate(ADMIN_POPULATE);
  return cert ? toAdminDTO(cert, options) : null;
};

// ─── Admin: registry ─────────────────────────────────────────────────────────

const buildListQuery = (query) => {
  const filter = {};
  const { status, type, programme, from, to } = query;

  if (status && STATUSES.includes(status)) filter.status = status;
  if (type && CERTIFICATE_TYPES.includes(type)) filter.type = type;
  if (programme) filter.programmes = cleanText(programme);

  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  if (fromDate || toDate) {
    filter.issueDate = {};
    if (fromDate) filter.issueDate.$gte = fromDate;
    if (toDate) filter.issueDate.$lt = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const search = cleanText(query.search || query.q || "").slice(0, 100);
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    const or = [
      { serial: pattern },
      { "recipient.fullName": pattern },
      { "recipient.email": pattern },
      { "recipient.studentIdNumber": pattern },
    ];
    const key = nameKeyFor(search);
    if (key) or.push({ "recipient.nameKey": new RegExp(escapeRegex(key)) });
    const code = normalizeVerificationCode(search);
    if (code.length === 12) or.push({ verificationCode: code });
    filter.$or = or;
  }
  return filter;
};

const SORTS = {
  newest: { issueDate: -1 },
  oldest: { issueDate: 1 },
  name: { "recipient.nameKey": 1, issueDate: -1 },
  completion: { completionDate: -1, issueDate: -1 },
};

exports.listCertificates = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const filter = buildListQuery(req.query);
    const sort = SORTS[req.query.sort] || SORTS.newest;

    const [total, certificates] = await Promise.all([
      Certificate.countDocuments(filter),
      Certificate.find(filter)
        .select("-events")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(ADMIN_POPULATE.filter((p) => p.path !== "events.actor")),
    ]);

    res.status(200).json({
      success: true,
      data: {
        certificates: certificates.map((c) => toAdminDTO(c)),
        pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCertificateStats = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const seriesStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

    const [byStatus, totals, thisMonth, monthly, latest] = await Promise.all([
      Certificate.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Certificate.aggregate([
        {
          $group: {
            _id: null,
            verifications: { $sum: "$stats.verifications" },
            downloads: { $sum: "$stats.downloads" },
          },
        },
      ]),
      Certificate.countDocuments({ issueDate: { $gte: monthStart } }),
      Certificate.aggregate([
        { $match: { issueDate: { $gte: seriesStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$issueDate", timezone: "UTC" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Certificate.findOne().sort({ issueDate: -1 }).select("issueDate").lean(),
    ]);

    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    byStatus.forEach((row) => {
      counts[row._id] = row.count;
    });
    const monthlyMap = Object.fromEntries(monthly.map((m) => [m._id, m.count]));
    const series = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      series.push({ month: key, count: monthlyMap[key] || 0 });
    }

    res.status(200).json({
      success: true,
      data: {
        total: counts.active + counts.revoked + counts.superseded,
        active: counts.active,
        revoked: counts.revoked,
        superseded: counts.superseded,
        issuedThisMonth: thisMonth,
        verifications: totals[0]?.verifications || 0,
        downloads: totals[0]?.downloads || 0,
        lastIssuedAt: latest?.issueDate || null,
        monthly: series,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCertificate = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const certificate = await loadAdminDTO(req.params.id, { includeEvents: true });
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }
    res.status(200).json({ success: true, data: { certificate } });
  } catch (error) {
    next(error);
  }
};

const CSV_COLUMNS = [
  ["Certificate ID", (c) => c.serial],
  ["Status", (c) => c.status],
  ["Type", (c) => TYPE_LABELS[c.type]],
  ["Recipient", (c) => c.recipient.fullName],
  ["Email", (c) => c.recipient.email || ""],
  ["Student ID", (c) => c.recipient.studentIdNumber || ""],
  ["Programmes", (c) => c.programmes.join("; ")],
  ["Completion date", (c) => toIsoDate(c.completionDate)],
  ["Issued at", (c) => new Date(c.issueDate).toISOString()],
  ["Mode of training", (c) => DELIVERY_LABELS[c.deliveryMode]],
  ["Verification code", (c) => c.verificationCode],
  ["Verification URL", (c) => toAdminDTO(c).verifyUrl],
  ["Verifications", (c) => c.stats?.verifications || 0],
  ["Downloads", (c) => c.stats?.downloads || 0],
  ["Batch", (c) => c.batchId || ""],
];

const csvCell = (value) => {
  let text = String(value ?? "");
  // Neutralise spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

exports.exportCertificates = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const filter = buildListQuery(req.query);
    const certificates = await Certificate.find(filter)
      .select("-events")
      .sort(SORTS[req.query.sort] || SORTS.newest)
      .limit(10000);

    const lines = [CSV_COLUMNS.map(([header]) => csvCell(header)).join(",")];
    certificates.forEach((cert) => {
      lines.push(CSV_COLUMNS.map(([, read]) => csvCell(read(cert))).join(","));
    });

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="asl-certificate-registry-${stamp}.csv"`,
    );
    res.status(200).send(`\uFEFF${lines.join("\r\n")}`);
  } catch (error) {
    next(error);
  }
};

// ─── Admin: issuing ──────────────────────────────────────────────────────────

exports.issueCertificate = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const { errors, value } = validateCertificateInput(req.body);
    if (Object.keys(errors).length > 0) return validationFailed(res, errors);

    const idempotencyKey = readIdempotencyKey(req);
    if (idempotencyKey) {
      const existing = await Certificate.findOne({ idempotencyKey }).select("_id");
      if (existing) {
        const certificate = await loadAdminDTO(existing._id, { includeEvents: true });
        return res.status(200).json({ success: true, replayed: true, data: { certificate } });
      }
    }

    const { student, error: studentError } = await resolveStudent({
      studentId: req.body?.recipient?.studentId,
      email: value.email,
    });
    if (studentError) return res.status(404).json({ success: false, message: studentError });

    if (!req.body.confirmDuplicate) {
      const duplicates = await findDuplicates({
        nameKey: nameKeyFor(value.fullName),
        studentId: student?._id,
        type: value.type,
        programmes: value.programmes,
      });
      if (duplicates.length > 0) {
        return res.status(409).json({
          success: false,
          code: "DUPLICATE",
          message: "An active certificate already exists for this recipient and programme",
          data: { duplicates },
        });
      }
    }

    let cert;
    try {
      cert = await createCertificate({ value, student, user: req.user, idempotencyKey });
    } catch (error) {
      // A concurrent request with the same key won the race; return its result
      if (error?.code === 11000 && error?.keyPattern?.idempotencyKey) {
        const existing = await Certificate.findOne({ idempotencyKey }).select("_id");
        const certificate = await loadAdminDTO(existing._id, { includeEvents: true });
        return res.status(200).json({ success: true, replayed: true, data: { certificate } });
      }
      throw error;
    }

    const emailStatus = await afterIssue(cert, req.body.options || {}, req.user);
    const certificate = await loadAdminDTO(cert._id, { includeEvents: true });

    res.status(201).json({
      success: true,
      message: `Certificate ${cert.serial} issued`,
      data: { certificate, delivery: { emailStatus } },
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkIssueCertificates = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const defaults = req.body?.defaults || {};
    const options = req.body?.options || {};
    const skipDuplicates = options.skipDuplicates !== false;

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "No rows to issue" });
    }
    if (rows.length > LIMITS.bulkMax) {
      return res.status(400).json({
        success: false,
        message: `A batch can contain at most ${LIMITS.bulkMax} certificates`,
      });
    }

    const baseKey = readIdempotencyKey(req);
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const batchId = `BATCH-${stamp}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const seenInFile = [];
    const results = [];
    const issued = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] || {};
      const input = {
        fullName: row.fullName,
        email: row.email,
        programmes:
          row.programmes && (Array.isArray(row.programmes) ? row.programmes.length : String(row.programmes).trim())
            ? row.programmes
            : defaults.programmes,
        completionDate: row.completionDate || defaults.completionDate,
        deliveryMode: row.deliveryMode || defaults.deliveryMode,
        type: row.type || defaults.type,
      };
      const { errors, value } = validateCertificateInput(input);
      if (Object.keys(errors).length > 0) {
        results.push({ index, status: "invalid", errors });
        continue;
      }

      const nameKey = nameKeyFor(value.fullName);
      const twin = seenInFile.find(
        (s) => s.nameKey === nameKey && s.type === value.type && programmeOverlap(s.programmes, value.programmes),
      );
      if (twin) {
        results.push({
          index,
          status: "duplicate",
          message: `Same recipient and programme as row ${twin.index + 1}`,
        });
        continue;
      }
      seenInFile.push({ index, nameKey, type: value.type, programmes: value.programmes });

      try {
        const idempotencyKey = baseKey ? `${baseKey}:${index}` : undefined;
        if (idempotencyKey) {
          const existing = await Certificate.findOne({ idempotencyKey });
          if (existing) {
            results.push({ index, status: "issued", replayed: true, certificate: toAdminDTO(existing) });
            continue;
          }
        }

        const { student } = await resolveStudent({ email: value.email });
        if (skipDuplicates) {
          const duplicates = await findDuplicates({
            nameKey,
            studentId: student?._id,
            type: value.type,
            programmes: value.programmes,
          });
          if (duplicates.length > 0) {
            results.push({
              index,
              status: "duplicate",
              message: `Already holds ${duplicates[0].serial}`,
              duplicates,
            });
            continue;
          }
        }

        const cert = await createCertificate({
          value,
          student,
          user: req.user,
          batchId,
          idempotencyKey,
        });
        issued.push(cert);
        results.push({ index, status: "issued", certificate: toAdminDTO(cert) });
      } catch (error) {
        console.error(`[certificates] bulk row ${index + 1} failed:`, error.message);
        results.push({ index, status: "failed", message: "Could not issue this certificate" });
      }
    }

    // Deliver after responding so large batches are not held open by the mail provider
    if (issued.length > 0) {
      setImmediate(async () => {
        for (const cert of issued) {
          try {
            await afterIssue(
              cert,
              { notifyRecipient: !!options.notifyRecipient, markGraduated: !!options.markGraduated },
              req.user,
            );
          } catch (error) {
            console.error(`[certificates] delivery for ${cert.serial} failed:`, error.message);
          }
        }
      });
    }

    const summary = results.reduce(
      (acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }),
      { issued: 0, duplicate: 0, invalid: 0, failed: 0 },
    );

    res.status(200).json({ success: true, data: { batchId, summary, results } });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: lifecycle ────────────────────────────────────────────────────────

exports.revokeCertificate = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const { value: reason, error } = validateReason(req.body?.reason);
    if (error) return res.status(400).json({ success: false, message: error });

    const updated = await Certificate.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      {
        $set: {
          status: "revoked",
          "revocation.at": new Date(),
          "revocation.by": req.user.userId,
          "revocation.reason": reason,
        },
        $push: pushEvent(auditEvent("revoked", req.user, { reason })),
      },
      { new: true },
    );
    if (!updated) {
      const exists = await Certificate.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? "Only active certificates can be revoked" : "Certificate not found",
      });
    }

    const certificate = await loadAdminDTO(updated._id, { includeEvents: true });
    res.status(200).json({ success: true, message: `${updated.serial} revoked`, data: { certificate } });
  } catch (error) {
    next(error);
  }
};

exports.reinstateCertificate = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const { value: reason, error } = validateReason(req.body?.reason);
    if (error) return res.status(400).json({ success: false, message: error });

    const updated = await Certificate.findOneAndUpdate(
      { _id: req.params.id, status: "revoked" },
      {
        $set: {
          status: "active",
          "revocation.at": null,
          "revocation.by": null,
          "revocation.reason": null,
        },
        $push: pushEvent(auditEvent("reinstated", req.user, { reason })),
      },
      { new: true },
    );
    if (!updated) {
      const exists = await Certificate.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? "Only revoked certificates can be reinstated" : "Certificate not found",
      });
    }

    const certificate = await loadAdminDTO(updated._id, { includeEvents: true });
    res.status(200).json({ success: true, message: `${updated.serial} reinstated`, data: { certificate } });
  } catch (error) {
    next(error);
  }
};

exports.reissueCertificate = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const { value: reason, error: reasonError } = validateReason(req.body?.reason);
    if (reasonError) return res.status(400).json({ success: false, message: reasonError });

    const original = await Certificate.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: "Certificate not found" });
    if (original.status === "superseded") {
      return res.status(409).json({
        success: false,
        message: "This certificate has already been replaced",
      });
    }

    // Corrections override the original; anything omitted carries over unchanged
    const body = req.body || {};
    const merged = {
      fullName: body.recipient?.fullName ?? original.recipient.fullName,
      email: body.recipient?.email ?? original.recipient.email,
      programmes: body.programmes ?? original.programmes,
      completionDate: body.completionDate ?? toIsoDate(original.completionDate),
      deliveryMode: body.deliveryMode ?? original.deliveryMode,
      type: body.type ?? original.type,
    };
    const { errors, value } = validateCertificateInput(merged);
    if (Object.keys(errors).length > 0) return validationFailed(res, errors);

    const hasStudentField = Object.prototype.hasOwnProperty.call(body.recipient || {}, "studentId");
    const { student, error: studentError } = await resolveStudent({
      studentId: hasStudentField ? body.recipient.studentId : original.recipient.student,
      email: value.email,
    });
    if (studentError) return res.status(404).json({ success: false, message: studentError });

    // Claim the original first so two admins cannot both replace it
    const previousStatus = original.status;
    const claimed = await Certificate.findOneAndUpdate(
      { _id: original._id, status: previousStatus },
      { $set: { status: "superseded" } },
      { new: true },
    );
    if (!claimed) {
      return res.status(409).json({
        success: false,
        message: "This certificate was changed by someone else. Refresh and try again.",
      });
    }

    let replacement;
    try {
      replacement = await createCertificate({
        value,
        student,
        user: req.user,
        supersedes: original._id,
        reissueReason: reason,
        idempotencyKey: readIdempotencyKey(req),
        eventType: "reissued",
      });
    } catch (error) {
      await Certificate.updateOne({ _id: original._id }, { $set: { status: previousStatus } });
      throw error;
    }

    await Certificate.updateOne(
      { _id: original._id },
      {
        $set: { supersededBy: replacement._id },
        $push: pushEvent(
          auditEvent("superseded", req.user, { reason, replacement: replacement.serial }),
        ),
      },
    );

    const emailStatus = await afterIssue(replacement, body.options || {}, req.user);
    const certificate = await loadAdminDTO(replacement._id, { includeEvents: true });

    res.status(201).json({
      success: true,
      message: `${original.serial} replaced by ${replacement.serial}`,
      data: { certificate, delivery: { emailStatus } },
    });
  } catch (error) {
    next(error);
  }
};

exports.recordCertificateEvent = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const { type, format } = req.body || {};
    if (type !== "downloaded" || !["pdf", "png"].includes(format)) {
      return res.status(400).json({ success: false, message: "Unsupported event" });
    }
    const updated = await Certificate.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { "stats.downloads": 1 },
        $set: { "stats.lastDownloadedAt": new Date() },
        $push: pushEvent(auditEvent("downloaded", req.user, { format })),
      },
      { new: true },
    ).select("stats");
    if (!updated) return res.status(404).json({ success: false, message: "Certificate not found" });
    res.status(200).json({ success: true, data: { stats: updated.stats } });
  } catch (error) {
    next(error);
  }
};

exports.resendCertificateEmail = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: "Certificate not found" });
    if (cert.status !== "active") {
      return res.status(409).json({ success: false, message: "Only active certificates can be sent" });
    }

    // Email is not part of the signed payload, so it can be corrected without reissuing
    const email = cleanText(req.body?.email || "").toLowerCase();
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return res.status(400).json({ success: false, message: "Enter a valid email address" });
      }
      cert.recipient.email = email;
      await Certificate.updateOne({ _id: cert._id }, { $set: { "recipient.email": email } });
    }
    if (!cert.recipient.email) {
      return res.status(400).json({ success: false, message: "Add a recipient email first" });
    }

    const emailStatus = await deliverEmail(cert, req.user);
    const certificate = await loadAdminDTO(cert._id, { includeEvents: true });
    res.status(emailStatus === "sent" ? 200 : 502).json({
      success: emailStatus === "sent",
      message:
        emailStatus === "sent"
          ? `Certificate sent to ${cert.recipient.email}`
          : "The email could not be delivered. Check the mail configuration and try again.",
      data: { certificate, delivery: { emailStatus } },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Public verification ─────────────────────────────────────────────────────

const respondVerification = async (res, cert) => {
  const integrity = checkIntegrity(cert);
  const result =
    integrity === "failed" ? "integrity_failed" : cert.status === "active" ? "valid" : cert.status;

  await Certificate.updateOne(
    { _id: cert._id },
    { $inc: { "stats.verifications": 1 }, $set: { "stats.lastVerifiedAt": new Date() } },
  );

  res.set("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    data: {
      result,
      integrity,
      checkedAt: new Date().toISOString(),
      // A record that fails its integrity check must not be displayed as genuine
      certificate: result === "integrity_failed" ? null : toPublicDTO(cert),
    },
  });
};

const notFound = (res) => {
  res.set("Cache-Control", "no-store");
  return res.status(404).json({
    success: false,
    message: "No certificate matches these details",
    data: { result: "not_found" },
  });
};

exports.verifyCertificate = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const code = normalizeVerificationCode(req.params.code);
    if (code.length !== 12) return notFound(res);
    const cert = await Certificate.findOne({ verificationCode: code }).populate({
      path: "supersededBy",
      select: "serial",
    });
    if (!cert) return notFound(res);
    return respondVerification(res, cert);
  } catch (error) {
    next(error);
  }
};

exports.lookupCertificate = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const serial = normalizeSerial(req.body?.serial);
    const surnameKey = nameKeyFor(req.body?.surname || "");
    if (!SERIAL_PATTERN.test(serial) || surnameKey.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Enter the certificate ID and the holder's surname",
      });
    }
    const cert = await Certificate.findOne({ serial }).populate({
      path: "supersededBy",
      select: "serial",
    });
    // Same response for unknown ID and wrong surname, so neither can be probed
    if (!cert || !` ${cert.recipient.nameKey} `.includes(` ${surnameKey} `)) return notFound(res);
    return respondVerification(res, cert);
  } catch (error) {
    next(error);
  }
};

// ─── Student portal ──────────────────────────────────────────────────────────

exports.getMyCertificates = async (req, res, next) => {
  try {
    if (global.useMockData) return dbUnavailable(res);
    const certificates = await Certificate.find({
      "recipient.student": req.user.userId,
      status: { $in: ["active", "revoked"] },
    })
      .select("-events")
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        certificates: certificates.map((cert) => ({ id: String(cert._id), ...toPublicDTO(cert) })),
      },
    });
  } catch (error) {
    next(error);
  }
};
