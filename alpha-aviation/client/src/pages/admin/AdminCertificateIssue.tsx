import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileStack,
  ImageDown,
  Info,
  Loader2,
  Maximize2,
  PenLine,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import { getAllStudents } from "@/api";
import {
  describeApiError,
  getCertificate,
  issueCertificate,
  newIdempotencyKey,
  recordCertificateDownload,
  reissueCertificate,
  type IssueResult,
} from "@/api/certificates";
import { AdminPageShell, AdminPanel } from "@/components/admin/AdminDashboardUI";
import { ProgrammePicker, Segmented } from "@/components/admin/certificates/controls";
import {
  CertDialog,
  FieldError,
  fieldInput,
  fieldInputError,
  fieldLabel,
} from "@/components/admin/certificates/shared";
import { copyText, formatShortDate } from "@/lib/certificates/format";
import { CertificatePreviewWithLayout } from "@/components/certificates/CertificatePreview";
import { useCertificateLayout } from "@/lib/certificates/preview";
import { useCertificateDownload } from "@/components/certificates/useCertificateDownload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Student } from "@/hooks/useAdminData";
import {
  CERTIFICATE_LIMITS,
  CERTIFICATE_TYPES,
  DEFAULT_SIGNATORIES,
  DELIVERY_LABELS,
  DELIVERY_MODES,
  TYPE_COPY,
} from "@/lib/certificates/template";
import {
  toArtworkData,
  type AdminCertificate,
  type CertificateArtworkData,
  type CertificateType,
  type DeliveryMode,
  type DuplicateMatch,
} from "@/lib/certificates/types";
import {
  formatCertificateDate,
  formatVerificationCode,
  needsCapitalisation,
  normalizePersonName,
  printedName,
  smartCapitalise,
  todayIso,
  validateCompletionDate,
  validateEmail,
  validatePersonName,
  validateProgrammes,
} from "@/lib/certificates/validation";
import { cn } from "@/lib/utils";

interface FormState {
  fullName: string;
  email: string;
  programmes: string[];
  type: CertificateType;
  completionDate: string;
  deliveryMode: DeliveryMode;
  notifyRecipient: boolean;
  markGraduated: boolean;
  reason: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  programmes: [],
  type: "completion",
  completionDate: todayIso(),
  deliveryMode: "online",
  notifyRecipient: true,
  markGraduated: true,
  reason: "",
};

type Phase = "edit" | "confirm" | "issuing" | "duplicate" | "done";

const AUTO_DOWNLOAD_KEY = "asl.certificates.autoDownload";
const readAutoDownload = () => {
  try {
    return localStorage.getItem(AUTO_DOWNLOAD_KEY) !== "false";
  } catch {
    return true;
  }
};

const studentName = (s: Student) => normalizePersonName(`${s.firstName ?? ""} ${s.lastName ?? ""}`);
const studentProgrammes = (s: Student & { selectedCourses?: string[] }) => {
  if (s.courseSelections?.length) return s.courseSelections.map((c) => c.title);
  if (s.selectedCourses?.length) return s.selectedCourses;
  return s.enrolledCourse ? [s.enrolledCourse] : [];
};

function Section({ step, title, description, children, aside }: { step: number; title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <AdminPanel>
      <div className="flex items-start gap-4 border-b border-[#DCE2EB] px-5 py-4 sm:px-6">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10264B] text-[12px] font-bold text-white tabular-nums">{step}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold tracking-tight text-[#10264B]">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-[#53647C]">{description}</p>}
        </div>
        {aside}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </AdminPanel>
  );
}

function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cn("flex items-start gap-3", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1246C8]/20",
          checked ? "bg-[#1246C8]" : "bg-[#C3CCDA]",
        )}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-subtle transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#10264B]">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-[#53647C]">{description}</span>}
      </span>
    </label>
  );
}

/** Searchable list of enrolled students; selecting one links the certificate to their account. */
function StudentPicker({ students, loading, onPick }: { students: Student[]; loading: boolean; onPick: (s: Student) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    // Accent-insensitive, so "adebayo" finds "Adébáyọ̀"
    const fold = (v: string) => v.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    const q = fold(query.trim());
    const pool = q
      ? students.filter((s) =>
          [studentName(s), s.email, s.studentIdNumber ?? ""].some((v) => fold(v).includes(q)),
        )
      : students;
    return pool.slice(0, 8);
  }, [query, students]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = (s: Student) => {
    onPick(s);
    setQuery("");
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && open && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9AB0]" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder="Search enrolled students by name, email or ID"
        role="combobox"
        aria-expanded={open}
        aria-controls="student-results"
        aria-autocomplete="list"
        className={cn(fieldInput, "pl-11")}
      />
      {open && (
        <div id="student-results" role="listbox" className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[#DCE2EB] bg-white p-1.5 shadow-elevated">
          {loading && (
            <p className="flex items-center gap-2 px-3 py-3 text-sm text-[#53647C]">
              <Loader2 className="h-4 w-4 animate-spin text-[#1246C8]" /> Loading students…
            </p>
          )}
          {!loading && results.length === 0 && <p className="px-3 py-3 text-sm text-[#8C9AB0]">No matching students. You can still type a name below.</p>}
          {results.map((s, i) => (
            <button
              key={s._id}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(s)}
              className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === active ? "bg-[#F2F6FF]" : "")}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1246C8] to-[#5B86FF] text-[11px] font-bold text-white">
                {`${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase() || "S"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#10264B]">{studentName(s) || s.email}</span>
                <span className="block truncate text-xs text-[#53647C]">
                  {s.email}
                  {s.studentIdNumber && ` · ${s.studentIdNumber}`}
                </span>
              </span>
              {s.status === "graduated" && <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Graduated</span>}
              {s.paymentStatus !== "Paid" && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{s.paymentStatus}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminCertificateIssue() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const reissueId = params.get("reissue");
  const studentParam = params.get("student");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [linked, setLinked] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [original, setOriginal] = useState<AdminCertificate | null>(null);
  const [originalError, setOriginalError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("edit");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [result, setResult] = useState<IssueResult | null>(null);
  const [autoDownload, setAutoDownload] = useState(readAutoDownload);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const idempotencyKey = useRef(newIdempotencyKey());

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setServerErrors((e) => ({ ...e, [key === "fullName" ? "fullName" : key]: "" }));
  };

  // A fresh key whenever the content changes; retries of an unchanged form reuse it.
  const formKey = JSON.stringify([form, linked?._id]);
  useEffect(() => {
    if (phase === "edit") idempotencyKey.current = newIdempotencyKey();
  }, [formKey, phase]);

  const linkStudent = useCallback((s: Student) => {
    setLinked(s);
    setForm((f) => ({
      ...f,
      fullName: studentName(s) || f.fullName,
      email: s.email || f.email,
      programmes: studentProgrammes(s).length ? studentProgrammes(s) : f.programmes,
      markGraduated: s.status !== "graduated",
    }));
  }, []);

  // Load students, then apply ?student= prefill or the reissued certificate's link.
  useEffect(() => {
    let cancelled = false;
    const studentsRequest: Promise<Student[]> = getAllStudents()
      .then((res) => {
        const raw = res?.data?.students ?? res?.students;
        return Array.isArray(raw) ? (raw as Student[]) : [];
      })
      .catch(() => []);

    studentsRequest.then((list) => {
      if (cancelled) return;
      setStudents(list);
      setStudentsLoading(false);
      if (studentParam && !reissueId) {
        const match = list.find((s) => s._id === studentParam);
        if (match) linkStudent(match);
      }
    });

    if (reissueId) {
      Promise.all([getCertificate(reissueId), studentsRequest])
        .then(([res, list]) => {
          if (cancelled) return;
          const cert = res.data.certificate;
          setOriginal(cert);
          setForm({
            ...EMPTY_FORM,
            fullName: cert.recipient.fullName,
            email: cert.recipient.email ?? "",
            programmes: cert.programmes,
            type: cert.type,
            completionDate: cert.completionDate,
            deliveryMode: cert.deliveryMode,
            notifyRecipient: !!cert.recipient.email,
            markGraduated: false,
          });
          const match = list.find((s) => s._id === cert.recipient.studentId);
          if (match) setLinked(match);
        })
        .catch((err) => {
          if (!cancelled) setOriginalError(describeApiError(err, "Could not load the certificate to reissue").message);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [reissueId, studentParam, linkStudent]);

  // ─── Validation ─────────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const e: Record<string, string | null> = {
      fullName: validatePersonName(form.fullName),
      email: form.email ? validateEmail(form.email) : form.notifyRecipient ? "Add an email to send the certificate, or turn off emailing" : null,
      programmes: validateProgrammes(form.programmes),
      completionDate: validateCompletionDate(form.completionDate),
      reason:
        reissueId && form.reason.trim().length < CERTIFICATE_LIMITS.reasonMin
          ? "Explain what is being corrected (kept in the audit log)"
          : null,
    };
    Object.entries(serverErrors).forEach(([k, v]) => {
      if (v) e[k] = v;
    });
    return e;
  }, [form, reissueId, serverErrors]);
  const firstError = Object.entries(errors).find(([, v]) => v);
  const errorFor = (key: string) => (showErrors || serverErrors[key] ? errors[key] : null);

  const dirty = formKey !== JSON.stringify([EMPTY_FORM, undefined]) && phase !== "done";
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  // ─── Preview ────────────────────────────────────────────────────────────────
  const previewData: CertificateArtworkData = useMemo(() => {
    if (phase === "done" && result) return toArtworkData(result.certificate);
    return {
      serial: null,
      verificationCode: null,
      verifyUrl: null,
      type: form.type,
      fullName: normalizePersonName(form.fullName) || "Recipient Name",
      programmes: form.programmes,
      completionDate: validateCompletionDate(form.completionDate) ? todayIso() : form.completionDate,
      deliveryMode: form.deliveryMode,
      signatories: original?.signatories ?? DEFAULT_SIGNATORIES,
    };
  }, [form, phase, result, original]);
  const { layout } = useCertificateLayout(previewData);

  const checks = useMemo(() => {
    const list: Array<{ tone: "ok" | "info" | "warn"; text: ReactNode; action?: ReactNode }> = [];
    if (!layout || !form.fullName.trim()) return list;
    if (layout.name.condensed) list.push({ tone: "warn", text: "Name is very long — letters are condensed to fit. Consider a shorter form of the name." });
    else if (layout.name.lines.length > 1) list.push({ tone: "info", text: "Long name — set on two lines." });
    else list.push({ tone: "ok", text: `Name fits on one line at ${Math.round(layout.name.size)}pt.` });
    if (needsCapitalisation(form.fullName)) {
      list.push({
        tone: "warn",
        text: "Name is typed in a single case. It prints in capitals, but the verification page and email show it as typed.",
        action: (
          <button type="button" onClick={() => set("fullName", smartCapitalise(form.fullName))} className="inline-flex items-center gap-1 font-semibold text-[#1246C8] hover:underline">
            <WandSparkles className="h-3.5 w-3.5" /> Fix capitalisation
          </button>
        ),
      });
    }
    if (form.programmes.length > 0) {
      list.push(
        layout.programmes.size < 22
          ? { tone: "info", text: `Programme list set in smaller type (${layout.programmes.lines.length} lines) to fit.` }
          : { tone: "ok", text: `${form.programmes.length} programme${form.programmes.length > 1 ? "s" : ""} on ${layout.programmes.lines.length} line${layout.programmes.lines.length > 1 ? "s" : ""}.` },
      );
    }
    return list;
  }, [layout, form.fullName, form.programmes]);

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const onDownloaded = useCallback(
    (format: "pdf" | "png") => {
      if (result) recordCertificateDownload(result.certificate.id, format);
    },
    [result],
  );
  const { busy, run } = useCertificateDownload(onDownloaded);

  const requestIssue = () => {
    setShowErrors(true);
    if (firstError) {
      toast(firstError[1] as string, "error");
      if (firstError[0] === "fullName") nameRef.current?.focus();
      return;
    }
    setRequestError(null);
    setPhase("confirm");
  };

  const submit = async (confirmDuplicate = false) => {
    setPhase("issuing");
    setRequestError(null);
    const payload = {
      recipient: {
        fullName: normalizePersonName(form.fullName),
        email: form.email.trim() || undefined,
        studentId: linked?._id ?? null,
      },
      programmes: form.programmes,
      type: form.type,
      completionDate: form.completionDate,
      deliveryMode: form.deliveryMode,
      options: { notifyRecipient: form.notifyRecipient && !!form.email.trim(), markGraduated: !!linked && form.markGraduated },
      confirmDuplicate,
    };
    try {
      const res = reissueId
        ? await reissueCertificate(reissueId, { ...payload, reason: form.reason.trim() }, idempotencyKey.current)
        : await issueCertificate(payload, idempotencyKey.current);
      setResult(res);
      setPhase("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
      const email = res.delivery?.emailStatus;
      toast(
        email === "failed"
          ? `${res.certificate.serial} issued, but the email could not be sent`
          : `${res.certificate.serial} issued${email === "sent" ? " and emailed" : ""}`,
        email === "failed" ? "info" : "success",
      );
      if (autoDownload) {
        const art = toArtworkData(res.certificate);
        setTimeout(() => run("pdf", art), 50);
      }
    } catch (err) {
      const info = describeApiError(err, "The certificate could not be issued");
      if (info.code === "DUPLICATE" && info.duplicates?.length) {
        setDuplicates(info.duplicates);
        setPhase("duplicate");
        return;
      }
      if (info.errors) {
        setServerErrors(info.errors);
        setShowErrors(true);
        setPhase("edit");
        toast(info.message, "error");
        return;
      }
      setRequestError(info.message);
      setPhase("confirm");
    }
  };

  const issueAnother = () => {
    setForm((f) => ({ ...EMPTY_FORM, programmes: f.programmes, type: f.type, completionDate: f.completionDate, deliveryMode: f.deliveryMode, notifyRecipient: f.notifyRecipient }));
    setLinked(null);
    setResult(null);
    setShowErrors(false);
    setServerErrors({});
    setPhase("edit");
    if (reissueId) navigate("/admin/dashboard/certificates/new", { replace: true });
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const onFormKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && phase === "edit") {
      e.preventDefault();
      requestIssue();
    }
  };

  const setAuto = (value: boolean) => {
    setAutoDownload(value);
    try {
      localStorage.setItem(AUTO_DOWNLOAD_KEY, String(value));
    } catch {
      /* preference is optional */
    }
  };

  const issued = result?.certificate;
  const issuedArt = issued ? toArtworkData(issued) : null;
  const nameParts = linked ? [linked.firstName, linked.lastName].map((p) => normalizePersonName(p ?? "")).filter(Boolean) : [];

  if (reissueId && originalError) {
    return (
      <AdminPageShell>
        <AdminPanel className="p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 font-semibold text-[#10264B]">{originalError}</p>
          <Link to="/admin/dashboard/certificates" className="mt-4 inline-block text-sm font-semibold text-[#1246C8] hover:underline">Back to registry</Link>
        </AdminPanel>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] font-semibold text-[#8C9AB0]">
            <Link to="/admin/dashboard/certificates" className="inline-flex items-center gap-1 hover:text-[#1246C8]">
              <ArrowLeft className="h-3.5 w-3.5" /> Certificates
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#53647C]">{reissueId ? "Correct & reissue" : "Issue"}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
            {reissueId ? "Correct & reissue" : "Issue certificate"}
          </h1>
          <p className="mt-2 max-w-2xl text-[#53647C]">
            {reissueId
              ? "Issue a corrected replacement. The original stays in the registry, marked as replaced, and its QR code points to the new certificate."
              : "Enter the recipient and programme. A unique ID, QR code and tamper-evident signature are created when you issue."}
          </p>
        </div>
        {!reissueId && (
          <Link
            to="/admin/dashboard/certificates?bulk=1"
            className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-full border border-[#10264B]/15 bg-white px-4 text-[13px] font-semibold text-[#10264B] shadow-subtle transition-colors hover:border-[#1246C8] hover:text-[#1246C8] sm:self-auto"
          >
            <FileStack className="h-4 w-4" /> Bulk issue from CSV
          </Link>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        {/* ─── Form / result column ─────────────────────────────────────────── */}
        <div className="min-w-0 space-y-5" onKeyDown={onFormKey}>
          <AnimatePresence mode="wait">
            {phase === "done" && issued && issuedArt ? (
              <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <AdminPanel>
                  <div className="relative overflow-hidden bg-[#07152E] px-6 py-7 text-white">
                    <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-60" />
                    <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
                    <div className="relative flex items-start gap-4">
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.2)]"
                      >
                        <Check className="h-6 w-6" strokeWidth={3} />
                      </motion.span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                          {issued.supersedes ? "Replacement issued" : "Certificate issued"}
                        </p>
                        <p className="mt-1.5 truncate text-xl font-bold tracking-tighter">{issued.recipient.fullName}</p>
                        <p className="mt-1 font-mono text-[15px] text-white/80">{issued.serial}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4">
                      <p className={fieldLabel}>Verification link</p>
                      <div className="flex items-center gap-2">
                        <code className="min-w-0 flex-1 truncate text-[13px] text-[#10264B]">{issued.verifyUrl}</code>
                        <button
                          type="button"
                          onClick={async () => {
                            if (await copyText(issued.verifyUrl)) {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1600);
                            }
                          }}
                          className="rounded-full p-2 text-[#53647C] hover:bg-white hover:text-[#1246C8]"
                          aria-label="Copy verification link"
                        >
                          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <a href={issued.verifyUrl} target="_blank" rel="noreferrer" className="rounded-full p-2 text-[#53647C] hover:bg-white hover:text-[#1246C8]" aria-label="Open verification page">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="mt-2 text-xs text-[#8C9AB0]">Code {formatVerificationCode(issued.verificationCode)}</p>
                    </div>

                    {result?.delivery?.emailStatus === "sent" && (
                      <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Emailed to {issued.recipient.email}</p>
                    )}
                    {result?.delivery?.emailStatus === "failed" && (
                      <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        The email couldn't be delivered. Download the PDF or resend from the registry.
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <Button onClick={() => run("pdf", issuedArt)} disabled={!!busy} className="col-span-3 sm:col-span-1">
                        {busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        PDF
                      </Button>
                      <Button variant="outline" onClick={() => run("png", issuedArt)} disabled={!!busy} className="col-span-3 sm:col-span-1">
                        {busy === "png" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageDown className="mr-2 h-4 w-4" />}
                        PNG
                      </Button>
                      <Button variant="outline" onClick={() => run("print", issuedArt)} disabled={!!busy} className="col-span-3 sm:col-span-1">
                        {busy === "print" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Print
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border-t border-[#DCE2EB] bg-[#F5F7FB]/60 px-6 py-4 sm:flex-row">
                    <Button variant="secondary" onClick={issueAnother} className="flex-1">
                      <Sparkles className="mr-2 h-4 w-4" /> Issue another
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/admin/dashboard/certificates?open=${issued.id}`)} className="flex-1">
                      View in registry
                    </Button>
                  </div>
                </AdminPanel>
                <p className="px-1 text-xs leading-relaxed text-[#8C9AB0]">
                  “Issue another” keeps the programme, date and mode so you can work through a cohort quickly.
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {reissueId && original && (
                  <div className="flex gap-3 rounded-panel border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      Replacing <strong className="font-mono">{original.serial}</strong>, issued {formatShortDate(original.issueDate)}. The replacement
                      gets a new ID and QR code.
                    </p>
                  </div>
                )}

                <Section step={1} title="Recipient" description="Link an enrolled student, or type any name.">
                  {!reissueId && (
                    <div>
                      {linked ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-[#1246C8]/20 bg-[#F2F6FF] p-3.5">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-white">
                            <UserRound className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#10264B]">{studentName(linked) || linked.email}</p>
                            <p className="truncate text-xs text-[#53647C]">
                              Linked account{linked.studentIdNumber ? ` · ${linked.studentIdNumber}` : ""} · appears in their portal
                            </p>
                          </div>
                          <button type="button" onClick={() => setLinked(null)} className="rounded-full p-2 text-[#53647C] hover:bg-white hover:text-[#10264B]" aria-label="Unlink student">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <StudentPicker students={students} loading={studentsLoading} onPick={linkStudent} />
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="cert-name" className={fieldLabel}>Full name as it should be printed</label>
                    <input
                      id="cert-name"
                      ref={nameRef}
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value.slice(0, CERTIFICATE_LIMITS.nameMax + 10))}
                      placeholder="e.g. Ugwuadu Vivian Chinonso"
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={!!errorFor("fullName")}
                      aria-describedby="cert-name-help"
                      className={cn(fieldInput, "text-[15px] font-medium", errorFor("fullName") && fieldInputError)}
                      data-autofocus
                      autoFocus={!reissueId && !studentParam}
                    />
                    <div id="cert-name-help" className="mt-1.5 flex items-start justify-between gap-3">
                      {errorFor("fullName") ? (
                        <FieldError>{errorFor("fullName")}</FieldError>
                      ) : (
                        <p className="min-w-0 truncate text-xs text-[#8C9AB0]">
                          {form.fullName.trim() ? <>Prints as <span className="font-semibold tracking-wide text-[#53647C]">{printedName(form.fullName)}</span></> : "Accents and Yoruba/Igbo diacritics are supported."}
                        </p>
                      )}
                      <span className={cn("shrink-0 text-[11px] tabular-nums", normalizePersonName(form.fullName).length > CERTIFICATE_LIMITS.nameMax ? "text-red-600" : "text-[#8C9AB0]")}>
                        {normalizePersonName(form.fullName).length}/{CERTIFICATE_LIMITS.nameMax}
                      </span>
                    </div>
                    {nameParts.length === 2 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[#8C9AB0]">Name order:</span>
                        {[nameParts.join(" "), [...nameParts].reverse().join(" ")].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => set("fullName", option)}
                            className={cn(
                              "rounded-full px-2.5 py-1 font-semibold transition-colors",
                              normalizePersonName(form.fullName) === option ? "bg-[#10264B] text-white" : "bg-[#F5F7FB] text-[#53647C] ring-1 ring-[#DCE2EB] hover:text-[#10264B]",
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cert-email" className={fieldLabel}>Email <span className="normal-case tracking-normal text-[#8C9AB0]">(optional)</span></label>
                    <input
                      id="cert-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="off"
                      aria-invalid={!!errorFor("email")}
                      className={cn(fieldInput, errorFor("email") && fieldInputError)}
                    />
                    <FieldError>{errorFor("email")}</FieldError>
                  </div>
                </Section>

                <Section
                  step={2}
                  title="Programmes"
                  description="Printed in the order selected."
                  aside={<span className="shrink-0 rounded-full bg-[#F5F7FB] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#53647C] ring-1 ring-[#DCE2EB]">{form.programmes.length}/{CERTIFICATE_LIMITS.programmesMax}</span>}
                >
                  <ProgrammePicker
                    value={form.programmes}
                    onChange={(v) => set("programmes", v)}
                    enrolled={linked ? studentProgrammes(linked) : []}
                    invalid={!!errorFor("programmes")}
                  />
                  <FieldError>{errorFor("programmes")}</FieldError>
                </Section>

                <Section step={3} title="Award details">
                  <div>
                    <span className={fieldLabel}>Certificate</span>
                    <Segmented
                      ariaLabel="Certificate type"
                      value={form.type}
                      onChange={(v) => set("type", v)}
                      options={CERTIFICATE_TYPES.map((t) => ({ value: t, label: TYPE_COPY[t].subtitle.replace("of ", "") }))}
                    />
                    <p className="mt-2 text-xs text-[#8C9AB0]">“{TYPE_COPY[form.type].lead} …”</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cert-date" className={fieldLabel}>Date of completion</label>
                      <input
                        id="cert-date"
                        type="date"
                        value={form.completionDate}
                        max={todayIso()}
                        min={CERTIFICATE_LIMITS.earliestCompletion}
                        onChange={(e) => set("completionDate", e.target.value)}
                        aria-invalid={!!errorFor("completionDate")}
                        className={cn(fieldInput, errorFor("completionDate") && fieldInputError)}
                      />
                      <FieldError>{errorFor("completionDate")}</FieldError>
                    </div>
                    <div>
                      <span className={fieldLabel}>Mode of training</span>
                      <select
                        value={form.deliveryMode}
                        onChange={(e) => set("deliveryMode", e.target.value as DeliveryMode)}
                        className={cn(fieldInput, "cursor-pointer")}
                        aria-label="Mode of training"
                      >
                        {DELIVERY_MODES.map((m) => (
                          <option key={m} value={m}>{DELIVERY_LABELS[m]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Section>

                <Section step={4} title="Delivery">
                  <Toggle
                    checked={form.notifyRecipient}
                    onChange={(v) => set("notifyRecipient", v)}
                    label="Email the certificate link"
                    description={form.email ? `Sends ${form.email.trim()} a link to view, download and verify.` : "Add an email above to enable."}
                  />
                  {linked && (
                    <Toggle
                      checked={form.markGraduated}
                      onChange={(v) => set("markGraduated", v)}
                      label="Mark student as graduated"
                      description={linked.status === "graduated" ? "Already graduated." : "Updates their status and unlocks their certificate page."}
                      disabled={linked.status === "graduated"}
                    />
                  )}
                  <Toggle
                    checked={autoDownload}
                    onChange={setAuto}
                    label="Download the PDF automatically"
                    description="Saves the print-ready PDF the moment the certificate is issued."
                  />
                  {reissueId && (
                    <div>
                      <label htmlFor="cert-reason" className={fieldLabel}>What is being corrected?</label>
                      <textarea
                        id="cert-reason"
                        rows={3}
                        value={form.reason}
                        onChange={(e) => set("reason", e.target.value.slice(0, CERTIFICATE_LIMITS.reasonMax))}
                        placeholder="e.g. Middle name was misspelled"
                        className={cn(fieldInput, "resize-none", errorFor("reason") && fieldInputError)}
                      />
                      <FieldError>{errorFor("reason")}</FieldError>
                    </div>
                  )}
                </Section>

                <div className="sticky bottom-4 z-20 flex items-center gap-3 rounded-panel border border-[#DCE2EB] bg-white/90 p-3 pl-5 shadow-elevated backdrop-blur-xl">
                  <p className="min-w-0 flex-1 truncate text-[13px] text-[#53647C]">
                    {firstError && showErrors ? (
                      <span className="font-medium text-red-600">{firstError[1]}</span>
                    ) : (
                      <span className="hidden sm:inline">
                        <kbd className="rounded border border-[#DCE2EB] bg-[#F5F7FB] px-1.5 py-0.5 font-mono text-[11px]">Ctrl</kbd> +{" "}
                        <kbd className="rounded border border-[#DCE2EB] bg-[#F5F7FB] px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd> to issue
                      </span>
                    )}
                  </p>
                  <Button onClick={requestIssue} disabled={phase === "issuing"} size="lg" className="shrink-0">
                    {reissueId ? <PenLine className="mr-2 h-4 w-4" /> : <BadgeCheck className="mr-2 h-4 w-4" />}
                    {reissueId ? "Reissue" : "Issue certificate"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Preview column ───────────────────────────────────────────────── */}
        <div className="min-w-0 xl:sticky xl:top-[92px] xl:self-start">
          <div className="relative overflow-hidden rounded-stage bg-[#07152E] p-3 shadow-float sm:p-5">
            <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
            <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1246C8]/40 blur-[100px]" />
            <div className="relative mb-3 flex items-center justify-between gap-3 px-1">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">
                <span className={cn("h-1.5 w-1.5 rounded-full", phase === "done" ? "bg-emerald-400" : "animate-pulse bg-[#5B86FF]")} />
                {phase === "done" ? "Issued certificate" : "Live preview"}
              </p>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Maximize2 className="h-3.5 w-3.5" /> Expand
              </button>
            </div>
            <div className="relative overflow-hidden rounded-[14px] shadow-elevated">
              <CertificatePreviewWithLayout data={previewData} layout={layout} />
            </div>
            <div className="relative mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 px-1 text-[11px] font-medium text-white/50">
              <span>A4 landscape · 300 dpi export</span>
              <span className="inline-flex items-center gap-1.5"><QrCode className="h-3.5 w-3.5" />{phase === "done" ? "QR linked to registry" : "QR generated on issue"}</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Signed record</span>
            </div>
          </div>

          {phase !== "done" && checks.length > 0 && (
            <div className="mt-4 rounded-panel border border-[#DCE2EB] bg-white p-4 shadow-subtle">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Print checks</p>
              <ul className="space-y-2">
                {checks.map((check, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#172B49]">
                    {check.tone === "ok" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
                    {check.tone === "info" && <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1246C8]" />}
                    {check.tone === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
                    <span className="min-w-0">
                      {check.text}
                      {check.action && <span className="ml-2">{check.action}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ─── Confirm ─────────────────────────────────────────────────────────── */}
      <CertDialog
        open={phase === "confirm" || phase === "issuing"}
        onClose={() => setPhase("edit")}
        busy={phase === "issuing"}
        size="sm"
        icon={<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]"><BadgeCheck className="h-5 w-5" /></div>}
        title={reissueId ? "Issue the corrected certificate?" : "Issue this certificate?"}
        description="It becomes a permanent registry record with its own ID and QR code."
        footer={
          <>
            <Button variant="outline" onClick={() => setPhase("edit")} disabled={phase === "issuing"}>Review again</Button>
            <Button onClick={() => submit(false)} disabled={phase === "issuing"} data-autofocus>
              {phase === "issuing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {phase === "issuing" ? "Issuing…" : requestError ? "Try again" : "Confirm & issue"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C9AB0]">Printed name</p>
            <p className="mt-0.5 break-words text-[15px] font-bold tracking-wide text-[#10264B]">{printedName(form.fullName)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C9AB0]">{TYPE_COPY[form.type].label}</p>
            <ul className="mt-0.5 space-y-0.5 text-sm font-medium text-[#172B49]">
              {form.programmes.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <p className="text-sm text-[#53647C]">
            Completed {formatCertificateDate(form.completionDate)} · {DELIVERY_LABELS[form.deliveryMode]}
          </p>
        </div>
        <ul className="mt-4 space-y-1.5 text-[13px] text-[#53647C]">
          {linked && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Linked to {studentName(linked)}'s student account{form.markGraduated && linked.status !== "graduated" ? ", marked graduated" : ""}</li>}
          {form.notifyRecipient && form.email && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Emailed to {form.email.trim()}</li>}
          {autoDownload && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />PDF downloads automatically</li>}
          {reissueId && original && <li className="flex gap-2"><RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{original.serial} will be marked as replaced</li>}
        </ul>
        {requestError && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {requestError} Retrying is safe — it will not create a duplicate.
          </p>
        )}
      </CertDialog>

      {/* ─── Duplicate warning ───────────────────────────────────────────────── */}
      <CertDialog
        open={phase === "duplicate"}
        onClose={() => setPhase("edit")}
        size="md"
        icon={<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"><AlertTriangle className="h-5 w-5" /></div>}
        title="This recipient already holds this certificate"
        description="An active certificate of the same type covers at least one of these programmes. To fix a mistake on it, use Correct & reissue instead."
        footer={
          <>
            <Button variant="outline" onClick={() => setPhase("edit")}>Cancel</Button>
            <Button variant="secondary" onClick={() => submit(true)}>Issue anyway</Button>
          </>
        }
      >
        <ul className="space-y-2">
          {duplicates.map((d) => (
            <li key={d.id} className="flex items-center gap-3 rounded-2xl border border-[#DCE2EB] p-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[13px] font-semibold text-[#10264B]">{d.serial}</p>
                <p className="truncate text-sm text-[#172B49]">{d.fullName}</p>
                <p className="truncate text-xs text-[#53647C]">{d.programmes.join(" · ")} · completed {formatCertificateDate(d.completionDate)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                <Link to={`/admin/dashboard/certificates?open=${d.id}`} className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#1246C8] hover:bg-[#F2F6FF]">View</Link>
                <Link to={`/admin/dashboard/certificates/new?reissue=${d.id}`} className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#10264B] ring-1 ring-[#DCE2EB] hover:ring-[#1246C8]">Reissue</Link>
              </div>
            </li>
          ))}
        </ul>
      </CertDialog>

      {/* ─── Expanded preview ────────────────────────────────────────────────── */}
      <CertDialog open={expanded} onClose={() => setExpanded(false)} size="xl" title={phase === "done" && issued ? issued.serial : "Certificate preview"} description={phase === "done" ? undefined : "SPECIMEN watermark and QR placeholder are replaced when the certificate is issued."}>
        <div className="overflow-hidden rounded-xl shadow-elevated ring-1 ring-[#10264B]/10">
          <CertificatePreviewWithLayout data={previewData} layout={layout} />
        </div>
      </CertDialog>
    </AdminPageShell>
  );
}
