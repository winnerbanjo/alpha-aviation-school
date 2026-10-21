import { useMemo, useRef, useState, type DragEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileDown,
  FileSpreadsheet,
  FileStack,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { bulkIssueCertificates, describeApiError, newIdempotencyKey } from "@/api/certificates";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CSV_TEMPLATE, parseCertificateSheet, toCsv, type ParsedRow } from "@/lib/certificates/csv";
import {
  CERTIFICATE_LIMITS,
  CERTIFICATE_TYPES,
  DELIVERY_LABELS,
  DELIVERY_MODES,
  TYPE_COPY,
} from "@/lib/certificates/template";
import {
  toArtworkData,
  type BulkIssueResponse,
  type BulkRowInput,
  type CertificateType,
  type DeliveryMode,
} from "@/lib/certificates/types";
import {
  formatCertificateDate,
  nameKeyClient,
  todayIso,
  validateCompletionDate,
  validateEmail,
  validatePersonName,
  validateProgrammes,
} from "@/lib/certificates/validation";
import { cn } from "@/lib/utils";
import { ProgrammePicker, Segmented } from "./controls";
import { CertDialog, fieldInput, fieldLabel } from "./shared";

type Step = "upload" | "review" | "issuing" | "results";

interface ReviewRow extends ParsedRow {
  resolved: Required<Pick<BulkRowInput, "fullName" | "completionDate" | "deliveryMode" | "type">> & {
    email?: string;
    programmes: string[];
  };
  problems: string[];
  duplicateOf?: number;
}

interface BulkIssueModalProps {
  open: boolean;
  onClose: () => void;
  onIssued: () => void;
}

const saveText = (text: string, filename: string, type = "text/csv;charset=utf-8") => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export function BulkIssueModal({ open, onClose, onIssued }: BulkIssueModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [sheetIssue, setSheetIssue] = useState<string | null>(null);
  const [ignoredHeaders, setIgnoredHeaders] = useState<string[]>([]);
  const [defaults, setDefaults] = useState({
    programmes: [] as string[],
    completionDate: todayIso(),
    deliveryMode: "online" as DeliveryMode,
    type: "completion" as CertificateType,
  });
  const [notify, setNotify] = useState(true);
  const [markGraduated, setMarkGraduated] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [response, setResponse] = useState<BulkIssueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfProgress, setPdfProgress] = useState<{ done: number; total: number } | null>(null);
  const keyRef = useRef(newIdempotencyKey());
  const fileInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setFileName(null);
    setRows([]);
    setSheetIssue(null);
    setIgnoredHeaders([]);
    setResponse(null);
    setError(null);
    setPdfProgress(null);
    keyRef.current = newIdempotencyKey();
  };

  const close = () => {
    if (step === "issuing" || pdfProgress) return;
    onClose();
    setTimeout(reset, 250);
  };

  const readFile = async (file: File) => {
    setSheetIssue(null);
    if (!/\.(csv|txt)$/i.test(file.name) && !file.type.includes("csv") && !file.type.startsWith("text/")) {
      setSheetIssue("Upload a .csv file. In Excel or Google Sheets use File → Download → CSV.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSheetIssue("That file is larger than 2 MB. Split it into smaller batches.");
      return;
    }
    const sheet = parseCertificateSheet(await file.text());
    setFileName(file.name);
    setIgnoredHeaders(sheet.ignoredHeaders);
    if (sheet.missingNameColumn) {
      setSheetIssue("No name column found. Add a header called full_name (see the template).");
      setRows([]);
      return;
    }
    if (sheet.rows.length === 0) {
      setSheetIssue("The file has a header but no recipients.");
      setRows([]);
      return;
    }
    if (sheet.rows.length > CERTIFICATE_LIMITS.bulkMax) {
      setSheetIssue(`A batch can hold up to ${CERTIFICATE_LIMITS.bulkMax} certificates; this file has ${sheet.rows.length}. Split it into smaller files.`);
      setRows([]);
      return;
    }
    setRows(sheet.rows);
    keyRef.current = newIdempotencyKey();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const review: ReviewRow[] = useMemo(() => {
    const seen = new Map<string, number>();
    return rows.map((row, i) => {
      const resolved = {
        fullName: row.input.fullName,
        email: row.input.email,
        programmes: (Array.isArray(row.input.programmes) && row.input.programmes.length ? row.input.programmes : defaults.programmes) as string[],
        completionDate: row.input.completionDate || defaults.completionDate,
        deliveryMode: row.input.deliveryMode || defaults.deliveryMode,
        type: row.input.type || defaults.type,
      };
      const problems = [
        validatePersonName(resolved.fullName),
        resolved.email ? validateEmail(resolved.email) : null,
        validateProgrammes(resolved.programmes) && (row.input.programmes ? validateProgrammes(resolved.programmes) : "No programme — pick a default"),
        validateCompletionDate(resolved.completionDate),
        row.unknown.deliveryMode ? `Unknown mode “${row.unknown.deliveryMode}”` : null,
        row.unknown.type ? `Unknown type “${row.unknown.type}”` : null,
      ].filter(Boolean) as string[];
      const key = `${nameKeyClient(resolved.fullName)}|${resolved.type}|${[...resolved.programmes].map((p) => p.toLowerCase()).sort().join(";")}`;
      const duplicateOf = problems.length === 0 && seen.has(key) ? seen.get(key) : undefined;
      if (problems.length === 0 && !seen.has(key)) seen.set(key, i);
      return { ...row, resolved, problems, duplicateOf };
    });
  }, [rows, defaults]);

  const ready = review.filter((r) => r.problems.length === 0 && r.duplicateOf === undefined);
  const invalid = review.filter((r) => r.problems.length > 0);
  const inFileDuplicates = review.filter((r) => r.duplicateOf !== undefined);
  const needsDefaultProgrammes = rows.some((r) => !(Array.isArray(r.input.programmes) && r.input.programmes.length));

  const issue = async () => {
    setStep("issuing");
    setError(null);
    try {
      const res = await bulkIssueCertificates(
        {
          rows: ready.map((r) => r.resolved),
          defaults,
          options: { notifyRecipient: notify, markGraduated, skipDuplicates: true },
        },
        keyRef.current,
      );
      setResponse(res);
      setStep("results");
      onIssued();
      toast(`${res.summary.issued} certificate${res.summary.issued === 1 ? "" : "s"} issued`, "success");
    } catch (err) {
      setError(`${describeApiError(err, "The batch could not be issued").message} Retrying is safe — certificates already created will not be duplicated.`);
      setStep("review");
    }
  };

  const issuedCerts = response?.results.filter((r) => r.certificate).map((r) => r.certificate!) ?? [];

  const downloadCombined = async () => {
    if (issuedCerts.length === 0) return;
    setPdfProgress({ done: 0, total: issuedCerts.length });
    try {
      const { buildBatchPdf, saveBlob } = await import("@/lib/certificates/export");
      const blob = await buildBatchPdf(issuedCerts.map(toArtworkData), (done, total) => setPdfProgress({ done, total }));
      saveBlob(blob, `${response?.batchId ?? "ASL-certificates"}.pdf`);
    } catch (err) {
      toast(err instanceof Error ? `PDF export failed: ${err.message}` : "PDF export failed", "error");
    } finally {
      setPdfProgress(null);
    }
  };

  const downloadResults = () => {
    if (!response) return;
    const header = ["Row", "Name", "Result", "Certificate ID", "Verification URL", "Note"];
    const lines = response.results.map((r) => {
      const source = ready[r.index];
      return [
        source ? source.line : r.index + 1,
        r.certificate?.recipient.fullName ?? source?.resolved.fullName ?? "",
        r.status,
        r.certificate?.serial ?? "",
        r.certificate?.verifyUrl ?? "",
        r.message ?? (r.errors ? Object.values(r.errors).join("; ") : ""),
      ];
    });
    saveText(toCsv([header, ...lines]), `${response.batchId}-results.csv`);
  };

  const stepIndex = { upload: 0, review: 1, issuing: 1, results: 2 }[step];

  return (
    <CertDialog
      open={open}
      onClose={close}
      busy={step === "issuing" || !!pdfProgress}
      size="xl"
      icon={<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]"><FileStack className="h-5 w-5" /></div>}
      title="Bulk issue certificates"
      description={
        <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold">
          {["Upload list", "Review", "Results"].map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px]", i <= stepIndex ? "bg-[#1246C8] text-white" : "bg-[#EEF2F8] text-[#8C9AB0]")}>{i + 1}</span>
              <span className={i <= stepIndex ? "text-[#10264B]" : "text-[#8C9AB0]"}>{label}</span>
              {i < 2 && <span className="mx-1 h-px w-6 bg-[#DCE2EB]" />}
            </li>
          ))}
        </ol>
      }
      footer={
        step === "upload" ? (
          <>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={() => setStep("review")} disabled={rows.length === 0}>Review {rows.length || ""} rows</Button>
          </>
        ) : step === "review" || step === "issuing" ? (
          <>
            <Button variant="outline" onClick={() => setStep("upload")} disabled={step === "issuing"}>Back</Button>
            <Button onClick={issue} disabled={ready.length === 0 || step === "issuing"}>
              {step === "issuing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === "issuing" ? `Issuing ${ready.length}…` : `Issue ${ready.length} certificate${ready.length === 1 ? "" : "s"}`}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={downloadResults}><FileDown className="mr-2 h-4 w-4" />Results CSV</Button>
            <Button variant="outline" onClick={downloadCombined} disabled={issuedCerts.length === 0 || !!pdfProgress}>
              {pdfProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {pdfProgress ? `Rendering ${pdfProgress.done}/${pdfProgress.total}` : "All as one PDF"}
            </Button>
            <Button onClick={close} disabled={!!pdfProgress}>Done</Button>
          </>
        )
      }
    >
      {step === "upload" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                dragging ? "border-[#1246C8] bg-[#DCE8FF]/40" : "border-[#DCE2EB] bg-[#F5F7FB]/60 hover:border-[#1246C8]/50 hover:bg-[#DCE8FF]/20",
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                {fileName && rows.length ? <FileSpreadsheet className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
              </span>
              <p className="mt-4 text-sm font-semibold text-[#10264B]">{fileName ?? "Drop a CSV here or click to choose"}</p>
              <p className="mt-1 text-xs text-[#53647C]">
                {rows.length ? `${rows.length} recipient${rows.length === 1 ? "" : "s"} found` : `Up to ${CERTIFICATE_LIMITS.bulkMax} rows · Excel/Sheets → Download as CSV`}
              </p>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFile(file);
                  e.target.value = "";
                }}
              />
            </div>
            {sheetIssue && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {sheetIssue}
              </p>
            )}
            {ignoredHeaders.length > 0 && !sheetIssue && (
              <p className="text-xs text-[#53647C]">Ignored columns: {ignoredHeaders.join(", ")}</p>
            )}
            <div className="rounded-2xl border border-[#DCE2EB] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#10264B]">Columns</p>
                <button type="button" onClick={() => saveText(CSV_TEMPLATE, "asl-certificates-template.csv")} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1246C8] hover:underline">
                  <Download className="h-3.5 w-3.5" /> Template
                </button>
              </div>
              <ul className="mt-2 grid gap-1 text-[13px] text-[#53647C] sm:grid-cols-2">
                <li><code className="text-[#10264B]">full_name</code> — required</li>
                <li><code className="text-[#10264B]">email</code> — links students &amp; sends</li>
                <li><code className="text-[#10264B]">programmes</code> — separate with ;</li>
                <li><code className="text-[#10264B]">completion_date</code> — 2026-08-28 or 28/08/2026</li>
                <li><code className="text-[#10264B]">mode</code> — online, in-person, hybrid</li>
                <li><code className="text-[#10264B]">type</code> — completion, achievement…</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-[#F5F7FB] p-4 ring-1 ring-[#DCE2EB]">
            <div>
              <p className="text-sm font-semibold text-[#10264B]">Defaults for blank cells</p>
              <p className="mt-0.5 text-xs text-[#53647C]">Applied to every row that leaves a column empty.</p>
            </div>
            <div>
              <span className={fieldLabel}>Programmes</span>
              <ProgrammePicker compact value={defaults.programmes} onChange={(programmes) => setDefaults((d) => ({ ...d, programmes }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={fieldLabel}>Completed</span>
                <input type="date" value={defaults.completionDate} max={todayIso()} onChange={(e) => setDefaults((d) => ({ ...d, completionDate: e.target.value }))} className={cn(fieldInput, "py-2.5")} />
              </label>
              <label>
                <span className={fieldLabel}>Mode</span>
                <select value={defaults.deliveryMode} onChange={(e) => setDefaults((d) => ({ ...d, deliveryMode: e.target.value as DeliveryMode }))} className={cn(fieldInput, "cursor-pointer py-2.5")}>
                  {DELIVERY_MODES.map((m) => <option key={m} value={m}>{DELIVERY_LABELS[m]}</option>)}
                </select>
              </label>
            </div>
            <div>
              <span className={fieldLabel}>Certificate</span>
              <Segmented ariaLabel="Default certificate type" value={defaults.type} onChange={(type) => setDefaults((d) => ({ ...d, type }))} options={CERTIFICATE_TYPES.map((t) => ({ value: t, label: TYPE_COPY[t].subtitle.replace("of ", "") }))} />
            </div>
          </div>
        </div>
      )}

      {(step === "review" || step === "issuing") && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{ready.length} ready</span>
            {invalid.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-700"><XCircle className="h-3.5 w-3.5" />{invalid.length} need fixing — skipped</span>}
            {inFileDuplicates.length > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-800"><AlertTriangle className="h-3.5 w-3.5" />{inFileDuplicates.length} repeated in file — skipped</span>}
          </div>
          {needsDefaultProgrammes && defaults.programmes.length === 0 && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Some rows have no programme. Go back and choose a default programme, or add them to the file.
            </p>
          )}

          <div className="max-h-[46vh] overflow-auto rounded-2xl border border-[#DCE2EB]">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#F5F7FB] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#53647C]">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Programmes</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Check</th>
                </tr>
              </thead>
              <tbody>
                {review.map((r) => {
                  const bad = r.problems.length > 0;
                  const dup = r.duplicateOf !== undefined;
                  return (
                    <tr key={r.line} className={cn("border-t border-[#DCE2EB]/70 align-top", bad && "bg-red-50/40", dup && "bg-amber-50/40")}>
                      <td className="px-4 py-3 tabular-nums text-[#8C9AB0]">{r.line}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#10264B]">{r.resolved.fullName || <span className="italic text-[#8C9AB0]">missing</span>}</p>
                        {r.resolved.email && <p className="text-xs text-[#53647C]">{r.resolved.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#172B49]">
                        {r.resolved.programmes.join("; ") || "—"}
                        {!(Array.isArray(r.input.programmes) && r.input.programmes.length) && r.resolved.programmes.length > 0 && <span className="ml-1 text-[11px] text-[#8C9AB0]">(default)</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#172B49]">{formatCertificateDate(r.resolved.completionDate) || r.resolved.completionDate}</td>
                      <td className="px-4 py-3 text-[13px]">
                        {bad ? (
                          <ul className="space-y-0.5 text-red-700">{r.problems.map((p) => <li key={p}>{p}</li>)}</ul>
                        ) : dup ? (
                          <span className="text-amber-800">Same as row {review[r.duplicateOf!].line}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Ready</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 rounded-2xl bg-[#F5F7FB] p-4 ring-1 ring-[#DCE2EB] sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1246C8]" />
              <span><span className="font-semibold text-[#10264B]">Email recipients</span><span className="block text-xs text-[#53647C]">Rows with an email get their link after issuing.</span></span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={markGraduated} onChange={(e) => setMarkGraduated(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1246C8]" />
              <span><span className="font-semibold text-[#10264B]">Mark matched students as graduated</span><span className="block text-xs text-[#53647C]">Students are matched by email.</span></span>
            </label>
          </div>
          <p className="text-xs text-[#8C9AB0]">Recipients who already hold an active certificate for the same programme are skipped automatically.</p>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </div>
      )}

      {step === "results" && response && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#DCE2EB] bg-[#DCE2EB] sm:grid-cols-4">
            {[
              { label: "Issued", value: response.summary.issued, tone: "text-emerald-700" },
              { label: "Already held", value: response.summary.duplicate, tone: "text-amber-700" },
              { label: "Invalid", value: response.summary.invalid + invalid.length, tone: "text-red-700" },
              { label: "Failed", value: response.summary.failed, tone: "text-red-700" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">{s.label}</p>
                <p className={cn("mt-1 text-2xl font-bold tabular-nums", s.value ? s.tone : "text-[#10264B]")}>{s.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#53647C]">
            Batch <span className="font-mono text-[#10264B]">{response.batchId}</span>
            {notify && " · emails are being sent in the background"}
          </p>
          <div className="max-h-[42vh] overflow-auto rounded-2xl border border-[#DCE2EB]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 bg-[#F5F7FB] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#53647C]">
                <tr>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Certificate ID</th>
                </tr>
              </thead>
              <tbody>
                {response.results.map((r) => (
                  <tr key={r.index} className="border-t border-[#DCE2EB]/70">
                    <td className="px-4 py-3 font-semibold text-[#10264B]">{r.certificate?.recipient.fullName ?? ready[r.index]?.resolved.fullName}</td>
                    <td className="px-4 py-3 text-[13px]">
                      {r.status === "issued" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-4 w-4" />Issued{r.replayed ? " (earlier attempt)" : ""}</span>
                      ) : (
                        <span className={r.status === "duplicate" ? "text-amber-800" : "text-red-700"}>
                          {r.message ?? (r.errors ? Object.values(r.errors).join("; ") : r.status)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-[#10264B]">{r.certificate?.serial ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CertDialog>
  );
}
