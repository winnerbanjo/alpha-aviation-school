import type { BulkRowInput, CertificateType, DeliveryMode } from "./types";
import { cleanText, normalizeDateInput } from "./validation";

/** RFC 4180-style parser: quoted fields, escaped quotes, CRLF, BOM; auto-detects , ; or tab. */
export const parseCsv = (input: string): string[][] => {
  const text = input.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best,
  ",");

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
};

type Column = keyof BulkRowInput;

const HEADER_ALIASES: Record<string, Column> = {
  fullname: "fullName",
  name: "fullName",
  recipient: "fullName",
  recipientname: "fullName",
  studentname: "fullName",
  student: "fullName",
  email: "email",
  emailaddress: "email",
  programmes: "programmes",
  programme: "programmes",
  programs: "programmes",
  program: "programmes",
  courses: "programmes",
  course: "programmes",
  completiondate: "completionDate",
  dateofcompletion: "completionDate",
  completed: "completionDate",
  completion: "completionDate",
  date: "completionDate",
  mode: "deliveryMode",
  deliverymode: "deliveryMode",
  modeoftraining: "deliveryMode",
  delivery: "deliveryMode",
  type: "type",
  certificatetype: "type",
  award: "type",
};

const normaliseHeader = (header: string) => header.toLowerCase().replace(/[^a-z]/g, "");

const MODE_ALIASES: Record<string, DeliveryMode> = {
  online: "online",
  virtual: "online",
  onlinevirtual: "online",
  remote: "online",
  inperson: "in_person",
  oncampus: "in_person",
  physical: "in_person",
  onsite: "in_person",
  classroom: "in_person",
  hybrid: "hybrid",
  blended: "hybrid",
};

const TYPE_ALIASES: Record<string, CertificateType> = {
  completion: "completion",
  certificateofcompletion: "completion",
  achievement: "achievement",
  certificateofachievement: "achievement",
  participation: "participation",
  certificateofparticipation: "participation",
};

export interface ParsedRow {
  /** 1-based line in the file (header is line 1). */
  line: number;
  input: BulkRowInput;
  /** Cell values that could not be understood. */
  unknown: Partial<Record<"deliveryMode" | "type", string>>;
}

export interface ParsedSheet {
  rows: ParsedRow[];
  missingNameColumn: boolean;
  ignoredHeaders: string[];
}

export const parseCertificateSheet = (text: string): ParsedSheet => {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], missingNameColumn: true, ignoredHeaders: [] };

  const headers = table[0];
  const columns = headers.map((h) => HEADER_ALIASES[normaliseHeader(h)]);
  const ignoredHeaders = headers.filter((h, i) => h.trim() && !columns[i]);
  const missingNameColumn = !columns.includes("fullName");

  const rows = table.slice(1).map((cells, index) => {
    const input: BulkRowInput = { fullName: "" };
    const unknown: ParsedRow["unknown"] = {};
    cells.forEach((raw, i) => {
      const column = columns[i];
      const value = cleanText(raw);
      if (!column || !value) return;
      switch (column) {
        case "fullName":
          input.fullName = value;
          break;
        case "email":
          input.email = value.toLowerCase();
          break;
        case "programmes":
          input.programmes = value.split(/[;|]/).map((p) => p.trim()).filter(Boolean);
          break;
        case "completionDate":
          input.completionDate = normalizeDateInput(value);
          break;
        case "deliveryMode": {
          const mode = MODE_ALIASES[value.toLowerCase().replace(/[^a-z]/g, "")];
          if (mode) input.deliveryMode = mode;
          else unknown.deliveryMode = value;
          break;
        }
        case "type": {
          const type = TYPE_ALIASES[value.toLowerCase().replace(/[^a-z]/g, "")];
          if (type) input.type = type;
          else unknown.type = value;
          break;
        }
      }
    });
    return { line: index + 2, input, unknown };
  });

  return { rows, missingNameColumn, ignoredHeaders };
};

export const CSV_TEMPLATE = [
  "full_name,email,programmes,completion_date,mode,type",
  "Ugwuadu Vivian Chinonso,vivian@example.com,Air Ticketing & Reservation Management; Customer Service & Communication in Aviation,2026-08-28,online,completion",
  "Adébáyọ̀ Ọlálékan,,Visa Processing & Documentation,28/08/2026,in-person,",
  "María José Fernández,maria@example.com,,,hybrid,achievement",
].join("\r\n");

const csvCell = (value: unknown) => {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (rows: unknown[][]) => `\uFEFF${rows.map((r) => r.map(csvCell).join(",")).join("\r\n")}`;
