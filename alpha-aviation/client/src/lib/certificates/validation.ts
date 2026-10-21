import { CERTIFICATE_LIMITS as LIMITS } from "./template";

// Mirrors server/utils/certificateService.js so the form can flag problems
// before a request is made. The server remains the source of truth.

// Control, soft-hyphen, zero-width and bidi-override characters that could disguise a printed name
const CONTROL_CHARS =
  // eslint-disable-next-line no-control-regex -- stripping control characters is the point
  /[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

export const cleanText = (value: string) =>
  value.normalize("NFC").replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();

export const normalizePersonName = (value: string) =>
  cleanText(value).replace(/['`´ʼ‘]/g, "’").replace(/\s*-\s*/g, "-");

const NAME_PATTERN = /^[\p{Script=Latin}\p{M}][\p{Script=Latin}\p{M} ’.-]*$/u;

export const validatePersonName = (raw: string): string | null => {
  const name = normalizePersonName(raw);
  const letters = (name.match(/\p{L}/gu) || []).length;
  if (!name) return "Recipient name is required";
  if (name.length > LIMITS.nameMax) return `Name must be ${LIMITS.nameMax} characters or fewer`;
  if (letters < LIMITS.nameMin) return "Name must contain at least 2 letters";
  if (!NAME_PATTERN.test(name)) {
    return "Use letters, spaces, hyphens, apostrophes and full stops only";
  }
  if (/[’.-]{2,}/.test(name)) return "Name contains repeated punctuation";
  return null;
};

export const validateEmail = (raw: string): string | null => {
  const email = cleanText(raw);
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? null : "Enter a valid email address";
};

export const validateProgrammes = (programmes: string[]): string | null => {
  if (programmes.length === 0) return "Select at least one programme";
  if (programmes.length > LIMITS.programmesMax) {
    return `A certificate can list at most ${LIMITS.programmesMax} programmes`;
  }
  if (programmes.some((p) => p.length > LIMITS.programmeMax)) {
    return `Each programme title must be ${LIMITS.programmeMax} characters or fewer`;
  }
  if (programmes.join(", ").length > LIMITS.programmesTotalMax) {
    return "The programme list is too long to fit on the certificate";
  }
  return null;
};

export const todayIso = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const validateCompletionDate = (value: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Enter a valid completion date";
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return "Enter a valid completion date";
  if (value > todayIso()) return "Completion date cannot be in the future";
  if (value < LIMITS.earliestCompletion) return "Completion date is too far in the past";
  return null;
};

/** Converts a spreadsheet-style date (YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY) to YYYY-MM-DD. */
export const normalizeDateInput = (value: string): string => {
  const raw = value.trim();
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const dmy = raw.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return raw;
};

/** Accent/punctuation-insensitive key matching the server's duplicate check. */
export const nameKeyClient = (value: string) =>
  cleanText(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** True when a name was typed entirely in one case and would read oddly on the verification page. */
export const needsCapitalisation = (name: string) => {
  const letters = name.replace(/[^\p{L}]/gu, "");
  return letters.length > 3 && (letters === letters.toLowerCase() || letters === letters.toUpperCase());
};

/** "o’brien-SMITH" → "O’Brien-Smith". Capitalises after spaces, hyphens and apostrophes. */
export const smartCapitalise = (name: string) =>
  normalizePersonName(name)
    .toLocaleLowerCase()
    .replace(/(^|[\s\-’])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase());

/** Printed form of a name; uses locale-aware upper-casing (ß → SS). */
export const printedName = (name: string) => normalizePersonName(name).toLocaleUpperCase("en-GB");

export const formatCertificateDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const formatVerificationCode = (code?: string | null) =>
  code ? code.replace(/(.{4})(?=.)/g, "$1-") : "";

/** Safe ASCII filename stem: "ASL-CRT-2026-00042_Ugwuadu-Vivian-Chinonso". */
export const certificateFileStem = (serial: string | null | undefined, name: string) => {
  const slug = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return [serial || "ASL-certificate-preview", slug || "recipient"].join("_");
};
