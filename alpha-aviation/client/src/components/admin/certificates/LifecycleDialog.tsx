import { useEffect, useState } from "react";
import { Ban, Loader2, Mail, RotateCcw } from "lucide-react";
import {
  describeApiError,
  reinstateCertificate,
  revokeCertificate,
  sendCertificateEmail,
} from "@/api/certificates";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CERTIFICATE_LIMITS } from "@/lib/certificates/template";
import type { AdminCertificate } from "@/lib/certificates/types";
import { validateEmail } from "@/lib/certificates/validation";
import { CertDialog, FieldError, fieldInput, fieldInputError, fieldLabel } from "./shared";

export type LifecycleAction = "revoke" | "reinstate" | "email";

interface LifecycleDialogProps {
  action: LifecycleAction | null;
  certificate: AdminCertificate | null;
  onClose: () => void;
  onDone: (certificate: AdminCertificate) => void;
}

const COPY = {
  revoke: {
    title: "Revoke certificate",
    icon: <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Ban className="h-5 w-5" /></div>,
    confirm: "Revoke certificate",
    placeholder: "e.g. Issued in error — student did not complete the assessment",
  },
  reinstate: {
    title: "Reinstate certificate",
    icon: <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><RotateCcw className="h-5 w-5" /></div>,
    confirm: "Reinstate",
    placeholder: "e.g. Revocation was raised against the wrong record",
  },
  email: {
    title: "Email certificate",
    icon: <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]"><Mail className="h-5 w-5" /></div>,
    confirm: "Send email",
    placeholder: "",
  },
};

export function LifecycleDialog({ action, certificate, onClose, onDone }: LifecycleDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!action) return;
    setReason("");
    setEmail(certificate?.recipient.email ?? "");
    setError(null);
  }, [action, certificate]);

  if (!certificate) return null;
  const copy = action ? COPY[action] : COPY.revoke;
  const reasonError =
    reason.trim().length > 0 && reason.trim().length < CERTIFICATE_LIMITS.reasonMin
      ? `At least ${CERTIFICATE_LIMITS.reasonMin} characters`
      : null;
  const emailError = email ? validateEmail(email) : "Enter the recipient's email address";
  const canSubmit =
    action === "email" ? !emailError : reason.trim().length >= CERTIFICATE_LIMITS.reasonMin;

  const submit = async () => {
    if (!action || !canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      if (action === "revoke") {
        const updated = await revokeCertificate(certificate.id, reason.trim());
        toast(`${updated.serial} revoked. Its QR code now shows it as revoked.`, "success");
        onDone(updated);
      } else if (action === "reinstate") {
        const updated = await reinstateCertificate(certificate.id, reason.trim());
        toast(`${updated.serial} reinstated`, "success");
        onDone(updated);
      } else {
        const result = await sendCertificateEmail(certificate.id, email.trim().toLowerCase());
        toast(`Certificate sent to ${result.certificate.recipient.email}`, "success");
        onDone(result.certificate);
      }
      onClose();
    } catch (err) {
      setError(describeApiError(err, "The action could not be completed").message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CertDialog
      open={!!action}
      onClose={onClose}
      busy={busy}
      size="sm"
      icon={copy.icon}
      title={copy.title}
      description={
        action === "revoke" ? (
          <>
            <strong className="font-semibold text-[#10264B]">{certificate.serial}</strong> for {certificate.recipient.fullName} will
            show as revoked to anyone who scans it. You can reinstate it later.
          </>
        ) : action === "reinstate" ? (
          <>
            <strong className="font-semibold text-[#10264B]">{certificate.serial}</strong> will verify as valid again.
          </>
        ) : (
          <>Sends {certificate.recipient.fullName} a link to view, download and verify their certificate.</>
        )
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit || busy}
            variant={action === "revoke" ? "destructive" : "default"}
            className={action === "revoke" ? "rounded-full" : undefined}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {copy.confirm}
          </Button>
        </>
      }
    >
      {action === "email" ? (
        <label className="block">
          <span className={fieldLabel}>Recipient email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={`${fieldInput} ${email && emailError ? fieldInputError : ""}`}
            placeholder="name@example.com"
            autoComplete="off"
          />
          <FieldError>{email && emailError}</FieldError>
          {certificate.recipient.email && email.trim().toLowerCase() !== certificate.recipient.email && !emailError && (
            <p className="mt-2 text-xs text-[#53647C]">The recipient email on file will be updated.</p>
          )}
        </label>
      ) : (
        <label className="block">
          <span className={fieldLabel}>Reason (kept in the audit log)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, CERTIFICATE_LIMITS.reasonMax))}
            rows={4}
            className={`${fieldInput} resize-none ${reasonError ? fieldInputError : ""}`}
            placeholder={copy.placeholder}
          />
          <div className="mt-1.5 flex items-center justify-between">
            <FieldError>{reasonError}</FieldError>
            <span className="ml-auto text-[11px] tabular-nums text-[#8C9AB0]">
              {reason.length}/{CERTIFICATE_LIMITS.reasonMax}
            </span>
          </div>
        </label>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </CertDialog>
  );
}
