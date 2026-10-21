import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertOctagon,
  Ban,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileClock,
  ImageDown,
  Loader2,
  Mail,
  MailWarning,
  PenLine,
  Printer,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { describeApiError, getCertificate, recordCertificateDownload } from "@/api/certificates";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { useCertificateDownload } from "@/components/certificates/useCertificateDownload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DELIVERY_LABELS } from "@/lib/certificates/template";
import { toArtworkData, type AdminCertificate, type CertificateEvent } from "@/lib/certificates/types";
import { formatCertificateDate, formatVerificationCode } from "@/lib/certificates/validation";
import { cn } from "@/lib/utils";
import { LifecycleDialog, type LifecycleAction } from "./LifecycleDialog";
import { copyText, formatDateTime, relativeTime } from "@/lib/certificates/format";
import { CertificateStatusBadge } from "./shared";

interface CertificateDrawerProps {
  certificateId: string | null;
  onClose: () => void;
  onChanged: (certificate: AdminCertificate) => void;
  onOpen: (id: string) => void;
}

const EVENT_META: Record<CertificateEvent["type"], { label: string; icon: typeof Sparkles; tone: string }> = {
  issued: { label: "Issued", icon: Sparkles, tone: "bg-[#DCE8FF] text-[#1246C8]" },
  reissued: { label: "Issued as a correction", icon: PenLine, tone: "bg-[#DCE8FF] text-[#1246C8]" },
  superseded: { label: "Replaced", icon: RefreshCcw, tone: "bg-amber-50 text-amber-700" },
  revoked: { label: "Revoked", icon: Ban, tone: "bg-red-50 text-red-600" },
  reinstated: { label: "Reinstated", icon: RotateCcw, tone: "bg-emerald-50 text-emerald-600" },
  downloaded: { label: "Downloaded", icon: Download, tone: "bg-[#F5F7FB] text-[#53647C]" },
  emailed: { label: "Emailed to recipient", icon: Mail, tone: "bg-emerald-50 text-emerald-600" },
  email_failed: { label: "Email failed", icon: MailWarning, tone: "bg-red-50 text-red-600" },
};

function Detail({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[132px_1fr] gap-3 border-b border-[#DCE2EB]/70 py-3 text-sm last:border-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C9AB0]">{label}</dt>
      <dd className={cn("min-w-0 break-words font-medium text-[#10264B]", mono && "font-mono text-[13px]")}>{children}</dd>
    </div>
  );
}

function eventDetail(event: CertificateEvent) {
  const meta = event.meta || {};
  if (typeof meta.reason === "string") return `“${meta.reason}”`;
  if (typeof meta.replacement === "string") return `Replacement ${meta.replacement}`;
  if (typeof meta.to === "string") return meta.to;
  if (typeof meta.format === "string") return meta.format.toUpperCase();
  if (typeof meta.batchId === "string") return `Batch ${meta.batchId}`;
  return null;
}

export function CertificateDrawer({ certificateId, onClose, onChanged, onOpen }: CertificateDrawerProps) {
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<AdminCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<LifecycleAction | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCertificate(id);
      setCertificate(res.data.certificate);
    } catch (err) {
      setError(describeApiError(err, "Could not load this certificate").message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (certificateId) load(certificateId);
    else setCertificate(null);
  }, [certificateId, load]);

  useEffect(() => {
    if (!certificateId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !action && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [certificateId, action, onClose]);

  const onDownloaded = useCallback(
    (format: "pdf" | "png") => {
      if (!certificate) return;
      recordCertificateDownload(certificate.id, format).then(() => load(certificate.id));
    },
    [certificate, load],
  );
  const { busy, run } = useCertificateDownload(onDownloaded);

  const copy = async (label: string, text: string) => {
    if (await copyText(text)) {
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } else {
      toast("Couldn't copy to the clipboard", "error");
    }
  };

  const applyChange = (updated: AdminCertificate) => {
    setCertificate((prev) => ({ ...updated, events: updated.events ?? prev?.events }));
    onChanged(updated);
  };

  const art = certificate ? toArtworkData(certificate) : null;
  const isActive = certificate?.status === "active";

  return (
    <>
      {createPortal(
      <AnimatePresence>
        {certificateId && (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-[#07152E]/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Certificate details"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 right-0 flex w-full max-w-[760px] flex-col bg-[#F5F7FB] shadow-float"
            >
              <header className="flex items-center gap-3 border-b border-[#DCE2EB] bg-white px-5 py-4 sm:px-7">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C9AB0]">Certificate</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-mono text-[17px] font-semibold text-[#10264B]">
                      {certificate?.serial ?? (loading ? "Loading…" : "—")}
                    </h2>
                    {certificate && (
                      <button
                        type="button"
                        onClick={() => copy("serial", certificate.serial)}
                        className="rounded-full p-1.5 text-[#8C9AB0] transition-colors hover:bg-[#F5F7FB] hover:text-[#1246C8]"
                        aria-label="Copy certificate ID"
                      >
                        {copied === "serial" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                    {certificate && <CertificateStatusBadge status={certificate.status} />}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close details"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {error && (
                  <div className="m-6 rounded-panel border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {error}
                    <Button size="sm" variant="outline" className="ml-3" onClick={() => certificateId && load(certificateId)}>
                      Retry
                    </Button>
                  </div>
                )}

                {!certificate && loading && (
                  <div className="space-y-4 p-6">
                    <div className="aspect-[1754/1240] animate-pulse rounded-panel bg-white" />
                    <div className="h-40 animate-pulse rounded-panel bg-white" />
                  </div>
                )}

                {certificate && art && (
                  <div className="space-y-5 p-5 sm:p-7">
                    {certificate.integrity === "failed" && (
                      <div className="flex gap-3 rounded-panel border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>
                          <strong>Integrity check failed.</strong> This record no longer matches its signature, so public
                          verification reports it as unverifiable. It may have been edited outside the application —
                          reissue it to restore a valid certificate.
                        </p>
                      </div>
                    )}
                    {certificate.status === "revoked" && certificate.revocation && (
                      <div className="rounded-panel border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <p className="font-semibold">Revoked {formatDateTime(certificate.revocation.at)}{certificate.revocation.by ? ` by ${certificate.revocation.by}` : ""}</p>
                        <p className="mt-1 text-red-700/90">“{certificate.revocation.reason}”</p>
                      </div>
                    )}
                    {certificate.status === "superseded" && certificate.supersededBy && (
                      <button
                        type="button"
                        onClick={() => onOpen(certificate.supersededBy!.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-panel border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900 transition-colors hover:bg-amber-100/70"
                      >
                        <span>
                          Replaced by <strong className="font-mono">{certificate.supersededBy.serial}</strong>. Its QR code now points holders to the replacement.
                        </span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </button>
                    )}

                    <div className="overflow-hidden rounded-panel bg-[#07152E] p-2 shadow-elevated sm:p-3">
                      <div className="overflow-hidden rounded-[14px]">
                        <CertificatePreview data={art} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => run("pdf", art)} disabled={!!busy}>
                        {busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        PDF
                      </Button>
                      <Button variant="outline" onClick={() => run("png", art)} disabled={!!busy}>
                        {busy === "png" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageDown className="mr-2 h-4 w-4" />}
                        PNG
                      </Button>
                      <Button variant="outline" onClick={() => run("print", art)} disabled={!!busy}>
                        {busy === "print" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Print
                      </Button>
                      <Button variant="outline" onClick={() => copy("link", certificate.verifyUrl)}>
                        {copied === "link" ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied === "link" ? "Copied" : "Verification link"}
                      </Button>
                      <a
                        href={certificate.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-[#172B49] transition-colors hover:bg-white hover:text-[#1246C8]"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Public page
                      </a>
                    </div>

                    <section className="rounded-panel border border-[#DCE2EB] bg-white p-5 shadow-subtle">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <h3 className="text-[15px] font-bold tracking-tight text-[#10264B]">Record</h3>
                        <span className="text-[11px] font-medium text-[#8C9AB0]">Template {certificate.templateVersion}</span>
                      </div>
                      <dl>
                        <Detail label="Recipient">{certificate.recipient.fullName}</Detail>
                        <Detail label="Email">
                          {certificate.recipient.email ? (
                            <span className="inline-flex flex-wrap items-center gap-2">
                              {certificate.recipient.email}
                              {certificate.delivery.emailStatus === "sent" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" /> Sent {relativeTime(certificate.delivery.emailedAt)}
                                </span>
                              )}
                              {certificate.delivery.emailStatus === "failed" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                                  <MailWarning className="h-3 w-3" /> Delivery failed
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[#8C9AB0]">Not provided</span>
                          )}
                        </Detail>
                        {certificate.recipient.studentId && (
                          <Detail label="Student">
                            <span className="inline-flex items-center gap-2">
                              Linked account
                              {certificate.recipient.studentIdNumber && (
                                <span className="rounded-full bg-[#DCE8FF] px-2 py-0.5 font-mono text-[11px] text-[#1246C8]">
                                  {certificate.recipient.studentIdNumber}
                                </span>
                              )}
                            </span>
                          </Detail>
                        )}
                        <Detail label="Award">{certificate.typeLabel}</Detail>
                        <Detail label="Programmes">
                          <ul className="space-y-0.5">
                            {certificate.programmes.map((p) => <li key={p}>{p}</li>)}
                          </ul>
                        </Detail>
                        <Detail label="Completed">{formatCertificateDate(certificate.completionDate)}</Detail>
                        <Detail label="Mode">{DELIVERY_LABELS[certificate.deliveryMode]}</Detail>
                        <Detail label="Issued">
                          {formatDateTime(certificate.issueDate)}
                          {certificate.issuedBy?.name && <span className="text-[#53647C]"> · {certificate.issuedBy.name}</span>}
                        </Detail>
                        {certificate.supersedes && (
                          <Detail label="Replaces">
                            <button type="button" onClick={() => onOpen(certificate.supersedes!.id)} className="font-mono text-[13px] text-[#1246C8] hover:underline">
                              {certificate.supersedes.serial}
                            </button>
                            {certificate.reissueReason && <p className="mt-1 text-[13px] font-normal text-[#53647C]">“{certificate.reissueReason}”</p>}
                          </Detail>
                        )}
                        {certificate.batchId && <Detail label="Batch" mono>{certificate.batchId}</Detail>}
                        <Detail label="Verify code" mono>{formatVerificationCode(certificate.verificationCode)}</Detail>
                        {certificate.fingerprint && (
                          <Detail label="Fingerprint" mono>
                            <span className="inline-flex items-center gap-2">
                              {certificate.fingerprint}
                              {certificate.integrity === "verified" && <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Signature verified" />}
                            </span>
                          </Detail>
                        )}
                      </dl>
                    </section>

                    <section className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-[#DCE2EB] bg-[#DCE2EB] shadow-subtle">
                      {[
                        { label: "Verifications", value: certificate.stats.verifications, sub: `Last ${relativeTime(certificate.stats.lastVerifiedAt)}` },
                        { label: "Downloads", value: certificate.stats.downloads, sub: `Last ${relativeTime(certificate.stats.lastDownloadedAt)}` },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white p-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">{stat.label}</p>
                          <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tighter text-[#10264B]">{stat.value}</p>
                          <p className="mt-0.5 text-xs text-[#8C9AB0]">{stat.sub}</p>
                        </div>
                      ))}
                    </section>

                    <section className="rounded-panel border border-[#DCE2EB] bg-white p-5 shadow-subtle">
                      <h3 className="mb-4 flex items-center gap-2 text-[15px] font-bold tracking-tight text-[#10264B]">
                        <FileClock className="h-4 w-4 text-[#1246C8]" /> Activity
                      </h3>
                      <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-[#DCE2EB]">
                        {(certificate.events ?? []).map((event, i) => {
                          const meta = EVENT_META[event.type];
                          const Icon = meta.icon;
                          const detail = eventDetail(event);
                          return (
                            <li key={`${event.type}-${event.at}-${i}`} className="relative flex gap-3">
                              <span className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white", meta.tone)}>
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0 pt-1">
                                <p className="text-sm font-semibold text-[#10264B]">
                                  {meta.label}
                                  {event.actor && <span className="font-normal text-[#53647C]"> · {event.actor}</span>}
                                </p>
                                {detail && <p className="mt-0.5 break-words text-[13px] text-[#53647C]">{detail}</p>}
                                <p className="mt-0.5 text-[11px] text-[#8C9AB0]">{formatDateTime(event.at)}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </section>
                  </div>
                )}
              </div>

              {certificate && (
                <footer className="flex flex-wrap items-center gap-2 border-t border-[#DCE2EB] bg-white px-5 py-4 sm:px-7">
                  {isActive && (
                    <Button variant="outline" size="sm" onClick={() => setAction("email")}>
                      <Mail className="mr-2 h-4 w-4" />
                      {certificate.delivery.emailStatus === "sent" ? "Resend email" : "Email recipient"}
                    </Button>
                  )}
                  {certificate.status !== "superseded" && (
                    <Link
                      to={`/admin/dashboard/certificates/new?reissue=${certificate.id}`}
                      className="inline-flex h-9 items-center rounded-full border border-[#10264B]/15 bg-white px-4 text-[13px] font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8]"
                    >
                      <PenLine className="mr-2 h-4 w-4" />
                      Correct &amp; reissue
                    </Link>
                  )}
                  <span className="flex-1" />
                  {isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAction("revoke")}
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  )}
                  {certificate.status === "revoked" && (
                    <Button variant="outline" size="sm" onClick={() => setAction("reinstate")}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reinstate
                    </Button>
                  )}
                </footer>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>,
      document.body,
      )}

      <LifecycleDialog
        action={action}
        certificate={certificate}
        onClose={() => setAction(null)}
        onDone={(updated) => {
          applyChange(updated);
          load(updated.id);
        }}
      />
    </>
  );
}
