export type CertificateType = "completion" | "achievement" | "participation";
export type DeliveryMode = "online" | "in_person" | "hybrid";
export type CertificateStatus = "active" | "revoked" | "superseded";
export type CertificateIntegrity = "verified" | "failed" | "unavailable";
export type VerificationResult =
  | "valid"
  | "revoked"
  | "superseded"
  | "integrity_failed"
  | "not_found";

export interface Signatory {
  name: string;
  title?: string;
  organisation?: string;
}

/** Everything the certificate artwork needs to draw itself. */
export interface CertificateArtworkData {
  /** Absent while previewing a certificate that has not been issued yet. */
  serial?: string | null;
  verificationCode?: string | null;
  verifyUrl?: string | null;
  type: CertificateType;
  fullName: string;
  programmes: string[];
  /** YYYY-MM-DD */
  completionDate: string;
  deliveryMode: DeliveryMode;
  signatories: Signatory[];
  status?: CertificateStatus;
}

export interface CertificateEvent {
  type:
    | "issued"
    | "reissued"
    | "superseded"
    | "revoked"
    | "reinstated"
    | "downloaded"
    | "emailed"
    | "email_failed";
  at: string;
  actor: string | null;
  meta: Record<string, unknown>;
}

export interface CertificateRef {
  id: string;
  serial: string | null;
}

export interface AdminCertificate {
  id: string;
  serial: string;
  verificationCode: string;
  verifyUrl: string;
  type: CertificateType;
  typeLabel: string;
  recipient: {
    fullName: string;
    email: string | null;
    studentId: string | null;
    studentIdNumber: string | null;
  };
  programmes: string[];
  completionDate: string;
  issueDate: string;
  deliveryMode: DeliveryMode;
  signatories: Signatory[];
  templateVersion: string;
  status: CertificateStatus;
  revocation: { at: string; reason: string; by: string | null } | null;
  supersedes: CertificateRef | null;
  supersededBy: CertificateRef | null;
  reissueReason: string | null;
  batchId: string | null;
  issuedBy: { id: string; name: string | null } | null;
  stats: {
    verifications: number;
    lastVerifiedAt: string | null;
    downloads: number;
    lastDownloadedAt: string | null;
  };
  delivery: {
    emailStatus: "not_requested" | "sent" | "failed";
    emailedAt: string | null;
  };
  fingerprint: string | null;
  integrity: CertificateIntegrity;
  createdAt: string;
  updatedAt: string;
  events?: CertificateEvent[];
}

export interface PublicCertificate {
  id?: string;
  serial: string;
  verificationCode: string;
  verifyUrl: string;
  type: CertificateType;
  typeLabel: string;
  recipient: { fullName: string };
  programmes: string[];
  completionDate: string;
  issueDate: string;
  deliveryMode: DeliveryMode;
  signatories: Signatory[];
  templateVersion: string;
  status: CertificateStatus;
  revokedAt: string | null;
  supersededBySerial: string | null;
  fingerprint: string | null;
  issuer: string;
}

export interface CertificateStats {
  total: number;
  active: number;
  revoked: number;
  superseded: number;
  issuedThisMonth: number;
  verifications: number;
  downloads: number;
  lastIssuedAt: string | null;
  monthly: Array<{ month: string; count: number }>;
}

export interface DuplicateMatch {
  id: string;
  serial: string;
  fullName: string;
  programmes: string[];
  completionDate: string;
  issueDate: string;
}

export interface IssueCertificatePayload {
  recipient: { fullName: string; email?: string; studentId?: string | null };
  programmes: string[];
  type: CertificateType;
  completionDate: string;
  deliveryMode: DeliveryMode;
  options?: { notifyRecipient?: boolean; markGraduated?: boolean };
  confirmDuplicate?: boolean;
}

export interface BulkRowInput {
  fullName: string;
  email?: string;
  programmes?: string[] | string;
  completionDate?: string;
  deliveryMode?: DeliveryMode;
  type?: CertificateType;
}

export interface BulkRowResult {
  index: number;
  status: "issued" | "duplicate" | "invalid" | "failed";
  errors?: Record<string, string>;
  message?: string;
  replayed?: boolean;
  certificate?: AdminCertificate;
  duplicates?: DuplicateMatch[];
}

export interface BulkIssueResponse {
  batchId: string;
  summary: { issued: number; duplicate: number; invalid: number; failed: number };
  results: BulkRowResult[];
}

/** Maps any certificate payload onto what the artwork draws. */
export const toArtworkData = (
  cert: Pick<
    AdminCertificate,
    | "serial"
    | "verificationCode"
    | "verifyUrl"
    | "type"
    | "programmes"
    | "completionDate"
    | "deliveryMode"
    | "signatories"
    | "status"
  > & { recipient: { fullName: string } },
): CertificateArtworkData => ({
  serial: cert.serial,
  verificationCode: cert.verificationCode,
  verifyUrl: cert.verifyUrl,
  type: cert.type,
  fullName: cert.recipient.fullName,
  programmes: cert.programmes,
  completionDate: cert.completionDate,
  deliveryMode: cert.deliveryMode,
  signatories: cert.signatories,
  status: cert.status,
});
