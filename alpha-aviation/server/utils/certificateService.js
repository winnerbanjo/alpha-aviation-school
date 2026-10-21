const crypto = require("crypto");
const Counter = require("../models/Counter");

// ─── Template ────────────────────────────────────────────────────────────────
// Snapshotted onto every certificate at issue time. Changing these values only
// affects certificates issued afterwards.
const TEMPLATE_VERSION = "2026.1";

const DEFAULT_SIGNATORIES = [
  {
    name: "Dr. Evelyn Uche",
    title: "Founder & Group CEO",
    organisation: "Alpha Step Links Group",
  },
  {
    name: "Zainab Olawale",
    title: "Director of Studies",
    organisation: "Alpha Step Links Aviation School",
  },
];

const CERTIFICATE_TYPES = ["completion", "achievement", "participation"];
const DELIVERY_MODES = ["online", "in_person", "hybrid"];
const STATUSES = ["active", "revoked", "superseded"];

const TYPE_LABELS = {
  completion: "Certificate of Completion",
  achievement: "Certificate of Achievement",
  participation: "Certificate of Participation",
};

const DELIVERY_LABELS = {
  online: "Online/Virtual",
  in_person: "In-Person",
  hybrid: "Hybrid",
};

const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  programmesMax: 8,
  programmeMax: 120,
  programmesTotalMax: 360,
  reasonMin: 5,
  reasonMax: 500,
  bulkMax: 250,
  earliestCompletion: "2015-01-01",
};

// ─── Small helpers ───────────────────────────────────────────────────────────

const clientUrl = () =>
  (process.env.CLIENT_URL || "https://www.aslaviationschool.co").replace(/\/+$/, "");

const verifyUrlFor = (code) => `${clientUrl()}/verify/${code}`;

// Invisible/bidi control characters that can disguise a printed name
const CONTROL_CHARS =
  /[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

const cleanText = (value) =>
  typeof value === "string"
    ? value.normalize("NFC").replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim()
    : "";

const normalizePersonName = (value) =>
  cleanText(value)
    // Unify apostrophe variants (O'Brien, D’Souza) on the typographic one
    .replace(/['`´ʼ‘]/g, "’")
    .replace(/\s*-\s*/g, "-");

// Latin letters (incl. accents and Yoruba/Igbo dotted vowels) with spaces,
// hyphens, apostrophes and full stops. Anything else cannot be typeset by the
// certificate fonts.
const NAME_PATTERN = /^[\p{Script=Latin}\p{M}][\p{Script=Latin}\p{M} ’.\-]*$/u;

const nameKeyFor = (value) =>
  cleanText(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pad = (n) => String(n).padStart(2, "0");

const toIsoDate = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

const formatLongDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Parses YYYY-MM-DD (or DD/MM/YYYY) into a UTC-midnight Date, rejecting impossible days. */
const parseDateOnly = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  if (typeof value !== "string") return null;
  const raw = value.trim();
  let y;
  let m;
  let d;
  let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    [, y, m, d] = match;
  } else {
    match = raw.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
    if (!match) return null;
    [, d, m, y] = match;
  }
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
};

// ─── Validation ──────────────────────────────────────────────────────────────

const normalizeProgrammes = (input) => {
  const list = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/[;|\n]/)
      : [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const title = cleanText(item);
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(title);
  }
  return out;
};

/**
 * Validates and normalises the printable fields of a certificate.
 * Returns { value, errors } where errors is a field → message map.
 */
const validateCertificateInput = (input = {}) => {
  const errors = {};
  const recipient = input.recipient || {};

  const fullName = normalizePersonName(recipient.fullName ?? input.fullName);
  const letterCount = (fullName.match(/\p{L}/gu) || []).length;
  if (!fullName) {
    errors.fullName = "Recipient name is required";
  } else if (fullName.length > LIMITS.nameMax) {
    errors.fullName = `Name must be ${LIMITS.nameMax} characters or fewer`;
  } else if (letterCount < LIMITS.nameMin) {
    errors.fullName = "Name must contain at least 2 letters";
  } else if (!NAME_PATTERN.test(fullName)) {
    errors.fullName =
      "Name can only contain letters, spaces, hyphens, apostrophes and full stops";
  } else if (/[’.\-]{2,}/.test(fullName)) {
    errors.fullName = "Name contains repeated punctuation";
  }

  const emailRaw = cleanText(recipient.email ?? input.email).toLowerCase();
  if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailRaw)) {
    errors.email = "Enter a valid email address";
  }

  const programmes = normalizeProgrammes(input.programmes);
  if (programmes.length === 0) {
    errors.programmes = "Select at least one programme";
  } else if (programmes.length > LIMITS.programmesMax) {
    errors.programmes = `A certificate can list at most ${LIMITS.programmesMax} programmes`;
  } else if (programmes.some((p) => p.length > LIMITS.programmeMax)) {
    errors.programmes = `Each programme title must be ${LIMITS.programmeMax} characters or fewer`;
  } else if (programmes.join(", ").length > LIMITS.programmesTotalMax) {
    errors.programmes = "The programme list is too long to fit on the certificate";
  }

  const type = input.type || "completion";
  if (!CERTIFICATE_TYPES.includes(type)) {
    errors.type = "Unknown certificate type";
  }

  const deliveryMode = input.deliveryMode || "online";
  if (!DELIVERY_MODES.includes(deliveryMode)) {
    errors.deliveryMode = "Unknown mode of training";
  }

  const completionDate = parseDateOnly(input.completionDate);
  if (!completionDate) {
    errors.completionDate = "Enter a valid completion date";
  } else {
    // One day of headroom so admins ahead of UTC (e.g. Lagos) can pick "today"
    const latest = Date.now() + 24 * 60 * 60 * 1000;
    if (completionDate.getTime() > latest) {
      errors.completionDate = "Completion date cannot be in the future";
    } else if (completionDate < parseDateOnly(LIMITS.earliestCompletion)) {
      errors.completionDate = "Completion date is too far in the past";
    }
  }

  return {
    errors,
    value: {
      fullName,
      email: emailRaw || undefined,
      programmes,
      type,
      deliveryMode,
      completionDate,
    },
  };
};

const validateReason = (reason) => {
  const text = cleanText(reason);
  if (text.length < LIMITS.reasonMin) {
    return { error: `Please give a reason (at least ${LIMITS.reasonMin} characters)` };
  }
  if (text.length > LIMITS.reasonMax) {
    return { error: `Reason must be ${LIMITS.reasonMax} characters or fewer` };
  }
  return { value: text };
};

// ─── Identifiers ─────────────────────────────────────────────────────────────

// Crockford base32: no I, L, O or U, so codes survive being read aloud or retyped
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** 12 characters × 5 bits = 60 bits of entropy. */
const generateVerificationCode = (length = 12) => {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) code += CROCKFORD[bytes[i] & 31];
  return code;
};

const normalizeVerificationCode = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");

const formatVerificationCode = (code) => code.replace(/(.{4})(?=.)/g, "$1-");

const SERIAL_PATTERN = /^ASL-CRT-\d{4}-\d{5,}$/;

const normalizeSerial = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/–|—/g, "-");

/** Next registry number for the issue year; atomic across concurrent requests. */
const nextSerial = async (issueDate = new Date()) => {
  const year = new Date(issueDate).getUTCFullYear();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: `certificate-${year}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
      return `ASL-CRT-${year}-${String(counter.seq).padStart(5, "0")}`;
    } catch (error) {
      // Two first-of-the-year upserts can race on the insert; the retry increments
      if (error?.code !== 11000 || attempt === 2) throw error;
    }
  }
  throw new Error("Could not allocate a certificate number");
};

// ─── Signing ─────────────────────────────────────────────────────────────────

const signingKeys = () => {
  const keys = {};
  if (process.env.CERTIFICATE_SIGNING_SECRET) keys.k1 = process.env.CERTIFICATE_SIGNING_SECRET;
  if (process.env.JWT_SECRET) keys.jwt = process.env.JWT_SECRET;
  return keys;
};

const activeSigningKey = () => {
  const keys = signingKeys();
  if (keys.k1) return { id: "k1", secret: keys.k1 };
  if (keys.jwt) {
    if (!activeSigningKey.warned) {
      console.warn(
        "[certificates] CERTIFICATE_SIGNING_SECRET is not set; signing with JWT_SECRET. " +
          "Set a dedicated secret so rotating JWT_SECRET does not invalidate certificates.",
      );
      activeSigningKey.warned = true;
    }
    return { id: "jwt", secret: keys.jwt };
  }
  throw new Error("No certificate signing secret configured");
};

const canonicalPayload = (cert) =>
  JSON.stringify([
    "asl-certificate-v1",
    cert.serial,
    cert.verificationCode,
    cert.type,
    cert.recipient.fullName,
    [...cert.programmes],
    toIsoDate(cert.completionDate),
    new Date(cert.issueDate).toISOString(),
    cert.deliveryMode,
  ]);

const hmac = (secret, payload) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const signCertificate = (cert) => {
  const key = activeSigningKey();
  return { signature: hmac(key.secret, canonicalPayload(cert)), signatureKeyId: key.id };
};

/** "verified" | "failed" | "unavailable" (signing key no longer configured). */
const checkIntegrity = (cert) => {
  const secret = signingKeys()[cert.signatureKeyId];
  if (!secret || !cert.signature) return "unavailable";
  const expected = Buffer.from(hmac(secret, canonicalPayload(cert)), "hex");
  const actual = Buffer.from(cert.signature, "hex");
  if (expected.length !== actual.length) return "failed";
  return crypto.timingSafeEqual(expected, actual) ? "verified" : "failed";
};

const fingerprintOf = (cert) =>
  cert.signature ? cert.signature.slice(0, 16).toUpperCase().replace(/(.{4})(?=.)/g, "$1 ") : null;

// ─── Audit ───────────────────────────────────────────────────────────────────

const MAX_EVENTS = 200;

const auditEvent = (type, user, meta = {}) => ({
  type,
  at: new Date(),
  actor: user?.userId || null,
  actorEmail: user?.email,
  meta,
});

/** $push fragment that appends an event while capping the stored history. */
const pushEvent = (event) => ({ events: { $each: [event], $slice: -MAX_EVENTS } });

// ─── Serialisers ─────────────────────────────────────────────────────────────

const personName = (user) => {
  if (!user || typeof user !== "object") return null;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return name || user.email || null;
};

const refSummary = (ref) => {
  if (!ref) return null;
  if (typeof ref === "object" && ref.serial) return { id: String(ref._id), serial: ref.serial };
  return { id: String(ref._id || ref), serial: null };
};

const toAdminDTO = (cert, { includeEvents = false } = {}) => {
  const student = cert.recipient?.student;
  const dto = {
    id: String(cert._id),
    serial: cert.serial,
    verificationCode: cert.verificationCode,
    verifyUrl: verifyUrlFor(cert.verificationCode),
    type: cert.type,
    typeLabel: TYPE_LABELS[cert.type],
    recipient: {
      fullName: cert.recipient.fullName,
      email: cert.recipient.email || null,
      studentId: student ? String(student._id || student) : null,
      studentIdNumber: cert.recipient.studentIdNumber || null,
    },
    programmes: cert.programmes,
    completionDate: toIsoDate(cert.completionDate),
    issueDate: new Date(cert.issueDate).toISOString(),
    deliveryMode: cert.deliveryMode,
    signatories: cert.signatories,
    templateVersion: cert.templateVersion,
    status: cert.status,
    revocation:
      cert.status === "revoked" && cert.revocation
        ? {
            at: cert.revocation.at,
            reason: cert.revocation.reason,
            by: personName(cert.revocation.by),
          }
        : null,
    supersedes: refSummary(cert.supersedes),
    supersededBy: refSummary(cert.supersededBy),
    reissueReason: cert.reissueReason || null,
    batchId: cert.batchId || null,
    issuedBy: cert.issuedBy
      ? { id: String(cert.issuedBy._id || cert.issuedBy), name: personName(cert.issuedBy) }
      : null,
    stats: {
      verifications: cert.stats?.verifications || 0,
      lastVerifiedAt: cert.stats?.lastVerifiedAt || null,
      downloads: cert.stats?.downloads || 0,
      lastDownloadedAt: cert.stats?.lastDownloadedAt || null,
    },
    delivery: {
      emailStatus: cert.delivery?.emailStatus || "not_requested",
      emailedAt: cert.delivery?.emailedAt || null,
    },
    fingerprint: fingerprintOf(cert),
    integrity: checkIntegrity(cert),
    createdAt: cert.createdAt,
    updatedAt: cert.updatedAt,
  };
  if (includeEvents) {
    dto.events = [...(cert.events || [])]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .map((event) => ({
        type: event.type,
        at: event.at,
        actor: personName(event.actor) || event.actorEmail || null,
        meta: event.meta || {},
      }));
  }
  return dto;
};

/** What anyone holding the QR or serial may see. No email, student link or revocation reason. */
const toPublicDTO = (cert) => ({
  serial: cert.serial,
  verificationCode: cert.verificationCode,
  verifyUrl: verifyUrlFor(cert.verificationCode),
  type: cert.type,
  typeLabel: TYPE_LABELS[cert.type],
  recipient: { fullName: cert.recipient.fullName },
  programmes: cert.programmes,
  completionDate: toIsoDate(cert.completionDate),
  issueDate: new Date(cert.issueDate).toISOString(),
  deliveryMode: cert.deliveryMode,
  signatories: cert.signatories,
  templateVersion: cert.templateVersion,
  status: cert.status,
  revokedAt: cert.status === "revoked" ? cert.revocation?.at || null : null,
  supersededBySerial:
    cert.status === "superseded" && cert.supersededBy?.serial ? cert.supersededBy.serial : null,
  fingerprint: fingerprintOf(cert),
  issuer: "Alpha Step Links Aviation School",
});

module.exports = {
  TEMPLATE_VERSION,
  DEFAULT_SIGNATORIES,
  CERTIFICATE_TYPES,
  DELIVERY_MODES,
  STATUSES,
  TYPE_LABELS,
  DELIVERY_LABELS,
  LIMITS,
  SERIAL_PATTERN,
  clientUrl,
  verifyUrlFor,
  cleanText,
  normalizePersonName,
  nameKeyFor,
  escapeRegex,
  toIsoDate,
  formatLongDate,
  parseDateOnly,
  normalizeProgrammes,
  validateCertificateInput,
  validateReason,
  generateVerificationCode,
  normalizeVerificationCode,
  formatVerificationCode,
  normalizeSerial,
  nextSerial,
  signCertificate,
  checkIntegrity,
  auditEvent,
  pushEvent,
  toAdminDTO,
  toPublicDTO,
};
