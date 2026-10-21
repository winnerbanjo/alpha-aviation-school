import api from "./index";
import type {
  AdminCertificate,
  BulkIssueResponse,
  BulkRowInput,
  CertificateStats,
  CertificateStatus,
  CertificateType,
  DeliveryMode,
  DuplicateMatch,
  IssueCertificatePayload,
  PublicCertificate,
  VerificationResult,
} from "@/lib/certificates/types";

export interface CertificateListQuery {
  search?: string;
  status?: CertificateStatus | "all";
  type?: CertificateType | "all";
  programme?: string;
  from?: string;
  to?: string;
  sort?: "newest" | "oldest" | "name" | "completion";
  page?: number;
  limit?: number;
}

const cleanQuery = (query: CertificateListQuery) =>
  Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== "" && v !== "all"),
  );

/** Unique per user action so retries of the same click never issue twice. */
export const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─── Admin ───────────────────────────────────────────────────────────────────

export const listCertificates = async (query: CertificateListQuery) => {
  const response = await api.get("/admin/certificates", { params: cleanQuery(query) });
  return response.data as {
    success: boolean;
    data: {
      certificates: AdminCertificate[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  };
};

export const getCertificateStats = async () => {
  const response = await api.get("/admin/certificates/stats");
  return response.data as { success: boolean; data: CertificateStats };
};

export const getCertificate = async (id: string) => {
  const response = await api.get(`/admin/certificates/${id}`);
  return response.data as { success: boolean; data: { certificate: AdminCertificate } };
};

export interface IssueResult {
  certificate: AdminCertificate;
  delivery?: { emailStatus: "not_requested" | "sent" | "failed" };
  replayed?: boolean;
}

export const issueCertificate = async (payload: IssueCertificatePayload, idempotencyKey: string) => {
  const response = await api.post("/admin/certificates", payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return { ...(response.data.data as IssueResult), replayed: !!response.data.replayed };
};

export const reissueCertificate = async (
  id: string,
  payload: Partial<IssueCertificatePayload> & { reason: string },
  idempotencyKey: string,
) => {
  const response = await api.post(`/admin/certificates/${id}/reissue`, payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return response.data.data as IssueResult;
};

export const bulkIssueCertificates = async (
  body: {
    rows: BulkRowInput[];
    defaults: {
      programmes?: string[];
      completionDate?: string;
      deliveryMode?: DeliveryMode;
      type?: CertificateType;
    };
    options: { notifyRecipient?: boolean; markGraduated?: boolean; skipDuplicates?: boolean };
  },
  idempotencyKey: string,
) => {
  const response = await api.post("/admin/certificates/bulk", body, {
    headers: { "Idempotency-Key": idempotencyKey },
    // Large batches are issued sequentially server-side
    timeout: 180_000,
  });
  return response.data.data as BulkIssueResponse;
};

export const revokeCertificate = async (id: string, reason: string) => {
  const response = await api.post(`/admin/certificates/${id}/revoke`, { reason });
  return response.data.data.certificate as AdminCertificate;
};

export const reinstateCertificate = async (id: string, reason: string) => {
  const response = await api.post(`/admin/certificates/${id}/reinstate`, { reason });
  return response.data.data.certificate as AdminCertificate;
};

export const sendCertificateEmail = async (id: string, email?: string) => {
  const response = await api.post(`/admin/certificates/${id}/send`, email ? { email } : {});
  return response.data.data as IssueResult;
};

/** Fire-and-forget audit entry; a failure must never block the download itself. */
export const recordCertificateDownload = (id: string, format: "pdf" | "png") =>
  api.post(`/admin/certificates/${id}/events`, { type: "downloaded", format }).catch(() => undefined);

export const exportCertificateRegistry = async (query: CertificateListQuery) => {
  const response = await api.get("/admin/certificates/export", {
    params: cleanQuery(query),
    responseType: "blob",
    timeout: 120_000,
  });
  return response.data as Blob;
};

// ─── Public ──────────────────────────────────────────────────────────────────

export interface VerificationResponse {
  result: VerificationResult;
  integrity?: "verified" | "failed" | "unavailable";
  checkedAt?: string;
  certificate: PublicCertificate | null;
}

const readVerification = (error: unknown): VerificationResponse => {
  const err = error as { response?: { status?: number; data?: { data?: VerificationResponse } } };
  if (err.response?.status === 404) {
    return { result: "not_found", certificate: null, checkedAt: new Date().toISOString() };
  }
  throw error;
};

export const verifyCertificateCode = async (code: string) => {
  try {
    const response = await api.get(`/certificates/verify/${encodeURIComponent(code)}`);
    return response.data.data as VerificationResponse;
  } catch (error) {
    return readVerification(error);
  }
};

export const lookupCertificate = async (serial: string, surname: string) => {
  try {
    const response = await api.post("/certificates/lookup", { serial, surname });
    return response.data.data as VerificationResponse;
  } catch (error) {
    return readVerification(error);
  }
};

// ─── Student ─────────────────────────────────────────────────────────────────

export const getMyCertificates = async () => {
  const response = await api.get("/student/certificates");
  return response.data.data.certificates as PublicCertificate[];
};

// ─── Errors ──────────────────────────────────────────────────────────────────

export interface ApiErrorInfo {
  status?: number;
  code?: string;
  message: string;
  errors?: Record<string, string>;
  duplicates?: DuplicateMatch[];
}

export const describeApiError = (error: unknown, fallback = "Something went wrong"): ApiErrorInfo => {
  const err = error as {
    message?: string;
    code?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        code?: string;
        errors?: Record<string, string>;
        data?: { duplicates?: DuplicateMatch[] };
      };
    };
  };
  if (!err?.response) {
    return {
      message:
        err?.code === "ECONNABORTED"
          ? "The server took too long to respond. Check the registry before retrying."
          : "Can't reach the server. Check your connection and try again.",
    };
  }
  const data = err.response.data;
  return {
    status: err.response.status,
    code: data?.code,
    message: data?.message || fallback,
    errors: data?.errors,
    duplicates: data?.data?.duplicates,
  };
};
