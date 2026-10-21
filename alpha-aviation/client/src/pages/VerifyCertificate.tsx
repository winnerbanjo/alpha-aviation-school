import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Download,
  FileSearch,
  Fingerprint,
  ImageDown,
  Loader2,
  QrCode,
  RefreshCcw,
  SearchX,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  lookupCertificate,
  verifyCertificateCode,
  type VerificationResponse,
} from "@/api/certificates";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { useCertificateDownload } from "@/components/certificates/useCertificateDownload";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { DELIVERY_LABELS } from "@/lib/certificates/template";
import { toArtworkData, type VerificationResult } from "@/lib/certificates/types";
import { formatCertificateDate, formatVerificationCode } from "@/lib/certificates/validation";
import { cn } from "@/lib/utils";

type Mode = "code" | "serial";

const STATUS_COPY: Record<
  VerificationResult,
  { title: string; body: string; tone: "valid" | "warn" | "danger" | "neutral"; icon: typeof ShieldCheck }
> = {
  valid: {
    title: "Authentic certificate",
    body: "This certificate was issued by Alpha Step Links Aviation School and is valid. The details below match our registry.",
    tone: "valid",
    icon: ShieldCheck,
  },
  revoked: {
    title: "Certificate revoked",
    body: "This certificate was issued by Alpha Step Links Aviation School but has since been revoked. It should not be relied upon.",
    tone: "danger",
    icon: ShieldAlert,
  },
  superseded: {
    title: "Certificate replaced",
    body: "This certificate has been replaced by a corrected version. Ask the holder for the current certificate.",
    tone: "warn",
    icon: RefreshCcw,
  },
  integrity_failed: {
    title: "Could not be verified",
    body: "The registry record for this certificate failed its integrity check. Please contact the school before relying on it.",
    tone: "danger",
    icon: AlertOctagon,
  },
  not_found: {
    title: "No matching certificate",
    body: "We couldn't find a certificate with these details. Check the code or ID for typos — codes don't use the letters I, L, O or U.",
    tone: "neutral",
    icon: SearchX,
  },
};

const TONE = {
  valid: { ring: "ring-emerald-600/15", bg: "bg-emerald-50", icon: "bg-emerald-600 text-white", text: "text-emerald-800", bar: "bg-emerald-500" },
  warn: { ring: "ring-amber-600/20", bg: "bg-amber-50", icon: "bg-amber-500 text-white", text: "text-amber-900", bar: "bg-amber-500" },
  danger: { ring: "ring-red-600/15", bg: "bg-red-50", icon: "bg-red-600 text-white", text: "text-red-800", bar: "bg-red-500" },
  neutral: { ring: "ring-[#DCE2EB]", bg: "bg-white", icon: "bg-[#10264B] text-white", text: "text-[#10264B]", bar: "bg-[#8C9AB0]" },
};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-white/40 focus:border-[#8EAEFF] focus:bg-white/[0.09] focus:ring-4 focus:ring-[#5B86FF]/20";

function DetailRow({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[#DCE2EB]/70 py-3.5 last:border-0 sm:grid-cols-[170px_1fr] sm:gap-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C9AB0]">{label}</dt>
      <dd className={cn("text-[15px] font-semibold text-[#10264B]", mono && "font-mono text-[14px] tracking-wide")}>{children}</dd>
    </div>
  );
}

export function VerifyCertificate() {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("code");
  const [codeInput, setCodeInput] = useState(routeCode ? formatVerificationCode(routeCode.toUpperCase()) : "");
  const [serialInput, setSerialInput] = useState("");
  const [surnameInput, setSurnameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const { busy, run } = useCertificateDownload();

  useEffect(() => {
    if (!routeCode) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    verifyCertificateCode(routeCode)
      .then((res) => !cancelled && setResponse(res))
      .catch((err) => {
        if (cancelled) return;
        const status = err?.response?.status;
        setError(
          status === 429
            ? "Too many verification attempts from this network. Please wait a few minutes."
            : "The registry could not be reached. Please try again shortly.",
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [routeCode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mode === "code") {
      const normalized = codeInput.toUpperCase().replace(/[^0-9A-Z]/g, "");
      if (normalized.length !== 12) {
        setError("A verification code has 12 characters, e.g. K7QX-9MPA-3RZT.");
        return;
      }
      navigate(`/verify/${normalized}`);
      return;
    }
    if (!/^ASL-CRT-\d{4}-\d{5,}$/i.test(serialInput.trim()) || surnameInput.trim().length < 2) {
      setError("Enter the certificate ID (e.g. ASL-CRT-2026-00042) and the holder's surname.");
      return;
    }
    setLoading(true);
    try {
      setResponse(await lookupCertificate(serialInput.trim(), surnameInput.trim()));
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 429
          ? "Too many lookups from this network. Please wait a few minutes."
          : "The registry could not be reached. Please try again shortly.",
      );
    } finally {
      setLoading(false);
    }
  };

  const certificate = response?.certificate ?? null;
  const status = response ? STATUS_COPY[response.result] : null;
  const tone = status ? TONE[status.tone] : null;
  const artwork = certificate ? toArtworkData(certificate) : null;

  const copyLink = async () => {
    if (!certificate) return;
    try {
      await navigator.clipboard.writeText(certificate.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <NoIndexSEO
        title="Verify a Certificate"
        description="Confirm that a certificate issued by Alpha Step Links Aviation School is authentic and current."
        url={routeCode ? `/verify/${routeCode}` : "/verify"}
      />

      <section className="relative isolate overflow-hidden bg-[#07152E] text-white">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-chart-grid mask-fade-b" />
          <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#1246C8]/40 blur-[120px]" />
          <div className="absolute -bottom-48 left-1/4 h-[380px] w-[380px] rounded-full bg-[#AA8546]/15 blur-[110px]" />
        </div>
        <Container className="relative z-10 pb-16 pt-36 sm:pb-20 sm:pt-40">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-end">
            <div>
              <span className="eyebrow text-[#8EAEFF]">Credential registry</span>
              <h1 className="mt-4 text-4xl font-bold tracking-tightest sm:text-5xl">Verify a certificate</h1>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/70">
                Scan the QR code on any Alpha Step Links Aviation School certificate, or enter its details below,
                to confirm it is genuine and still valid.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-white/60">
                <span className="inline-flex items-center gap-2"><QrCode className="h-4 w-4 text-[#8EAEFF]" />QR linked to the live registry</span>
                <span className="inline-flex items-center gap-2"><Fingerprint className="h-4 w-4 text-[#8EAEFF]" />Tamper-evident signature</span>
              </div>
            </div>

            <form onSubmit={submit} className="glass rounded-panel p-5 shadow-float sm:p-6" noValidate>
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10" role="tablist" aria-label="Lookup method">
                {(["code", "serial"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => {
                      setMode(m);
                      setError(null);
                    }}
                    className={cn(
                      "rounded-full px-3 py-2 text-[13px] font-semibold transition-colors",
                      mode === m ? "bg-white text-[#10264B] shadow-subtle" : "text-white/70 hover:text-white",
                    )}
                  >
                    {m === "code" ? "Verification code" : "Certificate ID"}
                  </button>
                ))}
              </div>

              {mode === "code" ? (
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Verification code</span>
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="K7QX-9MPA-3RZT"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={20}
                    className={cn(inputClass, "font-mono tracking-[0.18em]")}
                  />
                  <span className="mt-2 block text-xs text-white/45">Printed under the QR code on the certificate.</span>
                </label>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Certificate ID</span>
                    <input
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                      placeholder="ASL-CRT-2026-00042"
                      autoComplete="off"
                      spellCheck={false}
                      className={cn(inputClass, "font-mono tracking-wider")}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Holder's surname</span>
                    <input
                      value={surnameInput}
                      onChange={(e) => setSurnameInput(e.target.value)}
                      placeholder="As printed on the certificate"
                      autoComplete="off"
                      className={inputClass}
                    />
                  </label>
                </div>
              )}

              {error && (
                <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
                Verify certificate
              </Button>
            </form>
          </div>
        </Container>
      </section>

      <section className="bg-[#F5F7FB] py-14 sm:py-20" aria-live="polite">
        <Container>
          {loading && !response && (
            <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
              <div className="h-[420px] animate-pulse rounded-panel bg-white shadow-subtle" />
              <div className="aspect-[1754/1240] animate-pulse rounded-panel bg-white shadow-subtle" />
            </div>
          )}

          {!loading && !response && (
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
              {[
                { icon: QrCode, title: "Scan or enter", body: "Use the QR code, the 12-character code, or the certificate ID with the holder's surname." },
                { icon: Fingerprint, title: "Checked live", body: "Details are read from the school's registry and checked against a tamper-evident signature." },
                { icon: BadgeCheck, title: "Clear outcome", body: "See at once whether the certificate is valid, replaced or revoked." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <h2 className="mt-4 text-[15px] font-bold tracking-tight text-[#10264B]">{title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#53647C]">{body}</p>
                </div>
              ))}
            </div>
          )}

          {response && status && tone && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-8">
              <div className={cn("relative overflow-hidden rounded-panel p-6 shadow-subtle ring-1 sm:p-7", tone.bg, tone.ring)}>
                <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", tone.bar)} />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tone.icon)}>
                    <status.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className={cn("text-xl font-bold tracking-tighter sm:text-2xl", tone.text)}>{status.title}</h2>
                    <p className="mt-1 max-w-3xl text-[15px] leading-relaxed text-[#44546C]">
                      {status.body}
                      {response.result === "superseded" && certificate?.supersededBySerial && (
                        <> Replacement ID: <strong className="font-mono text-[#10264B]">{certificate.supersededBySerial}</strong>.</>
                      )}
                      {response.result === "revoked" && certificate?.revokedAt && (
                        <> Revoked on {new Date(certificate.revokedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</>
                      )}
                    </p>
                  </div>
                  {response.checkedAt && (
                    <p className="shrink-0 text-xs font-medium text-[#8C9AB0] sm:text-right">
                      Checked
                      <br className="hidden sm:block" />{" "}
                      {new Date(response.checkedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  )}
                </div>
              </div>

              {certificate && artwork && (
                <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                  <div className="rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle sm:p-7">
                    <span className="eyebrow text-[#AA8546]">{certificate.typeLabel}</span>
                    <p className="mt-3 text-2xl font-bold tracking-tighter text-[#10264B]">{certificate.recipient.fullName}</p>
                    <dl className="mt-5">
                      <DetailRow label="Programmes">
                        <ul className="space-y-1">
                          {certificate.programmes.map((p) => <li key={p}>{p}</li>)}
                        </ul>
                      </DetailRow>
                      <DetailRow label="Completed">{formatCertificateDate(certificate.completionDate)}</DetailRow>
                      <DetailRow label="Mode of training">{DELIVERY_LABELS[certificate.deliveryMode]}</DetailRow>
                      <DetailRow label="Issued">
                        {new Date(certificate.issueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </DetailRow>
                      <DetailRow label="Certificate ID" mono>{certificate.serial}</DetailRow>
                      <DetailRow label="Issuer">{certificate.issuer}</DetailRow>
                      {certificate.fingerprint && (
                        <DetailRow label="Fingerprint" mono>
                          <span className="inline-flex items-center gap-2">
                            {certificate.fingerprint}
                            {response.integrity === "verified" && <BadgeCheck className="h-4 w-4 text-emerald-600" aria-label="Signature verified" />}
                          </span>
                        </DetailRow>
                      )}
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-panel shadow-elevated ring-1 ring-[#10264B]/10">
                      <CertificatePreview data={artwork} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {response.result === "valid" && (
                        <>
                          <Button onClick={() => run("pdf", artwork)} disabled={!!busy}>
                            {busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download PDF
                          </Button>
                          <Button variant="outline" onClick={() => run("png", artwork)} disabled={!!busy}>
                            {busy === "png" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageDown className="mr-2 h-4 w-4" />}
                            PNG
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" onClick={copyLink}>
                        {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? "Link copied" : "Copy verification link"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!certificate && response.result === "not_found" && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => { setResponse(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    Try another certificate <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </Container>
      </section>
    </>
  );
}
