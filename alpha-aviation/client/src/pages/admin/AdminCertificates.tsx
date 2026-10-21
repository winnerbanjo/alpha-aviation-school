import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileDown,
  FileStack,
  Loader2,
  Plus,
  ScanLine,
  Search,
  ShieldX,
  X,
} from "lucide-react";
import {
  describeApiError,
  exportCertificateRegistry,
  getCertificateStats,
  listCertificates,
  recordCertificateDownload,
  type CertificateListQuery,
} from "@/api/certificates";
import { AdminPageHeader, AdminPageShell, AdminPanel } from "@/components/admin/AdminDashboardUI";
import { BulkIssueModal } from "@/components/admin/certificates/BulkIssueModal";
import { CertificateDrawer } from "@/components/admin/certificates/CertificateDrawer";
import {
  CertificateStatusBadge,
  IssuanceSparkline,
  fieldInput,
} from "@/components/admin/certificates/shared";
import { copyText, formatShortDate, initialsOf, relativeTime } from "@/lib/certificates/format";
import { useCertificateDownload } from "@/components/certificates/useCertificateDownload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CERTIFICATE_TYPES, TYPE_COPY } from "@/lib/certificates/template";
import {
  toArtworkData,
  type AdminCertificate,
  type CertificateStats,
  type CertificateStatus,
  type CertificateType,
} from "@/lib/certificates/types";
import { formatCertificateDate } from "@/lib/certificates/validation";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const STATUS_TABS: Array<{ value: CertificateStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "revoked", label: "Revoked" },
  { value: "superseded", label: "Replaced" },
];

function MetricTile({ label, value, helper, icon: Icon, children }: { label: string; value: number | string; helper?: string; icon: typeof Award; children?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 bg-white p-6">
      <div className="min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">{label}</p>
        <p className="mt-1.5 text-3xl font-bold tabular-nums tracking-tightest text-[#10264B]">{value}</p>
        {helper && <p className="mt-1 truncate text-sm text-[#53647C]">{helper}</p>}
      </div>
      {children}
    </div>
  );
}

export function AdminCertificates() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = (params.get("status") as CertificateStatus | "all" | null) ?? "all";
  const type = (params.get("type") as CertificateType | "all" | null) ?? "all";
  const sort = (params.get("sort") as CertificateListQuery["sort"]) ?? "newest";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const openId = params.get("open");
  const bulkOpen = params.get("bulk") === "1";

  const [searchInput, setSearchInput] = useState(search);
  const [rows, setRows] = useState<AdminCertificate[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const requestId = useRef(0);

  const update = useCallback(
    (changes: Record<string, string | null>, resetPage = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => (v === null || v === "" || v === "all" ? next.delete(k) : next.set(k, v)));
          if (resetPage) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // Debounce the search box into the URL
  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => update({ q: searchInput.trim() || null }), 300);
    return () => clearTimeout(t);
  }, [searchInput, search, update]);

  const query = useMemo<CertificateListQuery>(() => ({ search, status, type, sort, page, limit: PAGE_SIZE }), [search, status, type, sort, page]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const [list, statsRes] = await Promise.all([listCertificates(query), getCertificateStats()]);
      if (id !== requestId.current) return;
      setRows(list.data.certificates);
      setPagination({ total: list.data.pagination.total, pages: list.data.pagination.pages });
      setStats(statsRes.data);
    } catch (err) {
      if (id === requestId.current) setError(describeApiError(err, "Could not load the certificate registry").message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const { run } = useCertificateDownload();
  const downloadRow = async (cert: AdminCertificate) => {
    setRowBusy(cert.id);
    await run("pdf", toArtworkData(cert));
    recordCertificateDownload(cert.id, "pdf");
    setRowBusy(null);
  };

  const copyLink = async (cert: AdminCertificate) => {
    if (await copyText(cert.verifyUrl)) {
      setCopiedId(cert.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await exportCertificateRegistry({ search, status, type, sort });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `asl-certificate-registry-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      toast(describeApiError(err, "Export failed").message, "error");
    } finally {
      setExporting(false);
    }
  };

  const onChanged = (updated: AdminCertificate) => {
    setRows((current) => current.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    getCertificateStats().then((res) => setStats(res.data)).catch(() => undefined);
  };

  const filtersActive = !!search || status !== "all" || type !== "all";
  const from = pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, pagination.total);
  const statusCount = (s: CertificateStatus | "all") =>
    !stats ? null : s === "all" ? stats.total : s === "active" ? stats.active : s === "revoked" ? stats.revoked : stats.superseded;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Certificates"
        description="Issue, download and manage verifiable certificates. Every certificate carries a unique ID, a QR code and a tamper-evident signature."
        meta={stats?.lastIssuedAt ? `Last issued ${relativeTime(stats.lastIssuedAt)}` : undefined}
        onRefresh={load}
        refreshing={loading}
        action={
          <>
            <Button variant="outline" size="sm" className="bg-white shadow-subtle" onClick={() => update({ bulk: "1" }, false)}>
              <FileStack className="mr-2 h-4 w-4" /> Bulk issue
            </Button>
            <Link
              to="/admin/dashboard/certificates/new"
              className="inline-flex h-9 items-center rounded-full bg-[#1246C8] px-4 text-[13px] font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Issue certificate
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-panel border border-[#DCE2EB] bg-[#DCE2EB] shadow-subtle sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Issued" value={stats?.total ?? "—"} helper={stats ? `${stats.issuedThisMonth} this month` : undefined} icon={Award}>
          {stats && <div className="hidden w-[46%] sm:block"><IssuanceSparkline series={stats.monthly} /></div>}
        </MetricTile>
        <MetricTile label="Active" value={stats?.active ?? "—"} helper="Verify as valid" icon={BadgeCheck} />
        <MetricTile label="Revoked / replaced" value={stats ? stats.revoked + stats.superseded : "—"} helper={stats ? `${stats.revoked} revoked · ${stats.superseded} replaced` : undefined} icon={ShieldX} />
        <MetricTile label="Verification scans" value={stats?.verifications ?? "—"} helper={stats ? `${stats.downloads} downloads` : undefined} icon={ScanLine} />
      </div>

      <AdminPanel>
        <div className="flex flex-col gap-4 border-b border-[#DCE2EB] p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9AB0]" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, certificate ID, email, student ID or code"
              className={cn(fieldInput, "py-2.5 pl-11 pr-10")}
              aria-label="Search certificates"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#8C9AB0] hover:text-[#10264B]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-[#F5F7FB] p-1 ring-1 ring-[#DCE2EB]" role="tablist" aria-label="Status">
              {STATUS_TABS.map((tab) => {
                const count = statusCount(tab.value);
                const selected = status === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => update({ status: tab.value })}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                      selected ? "bg-white text-[#10264B] shadow-subtle" : "text-[#53647C] hover:text-[#10264B]",
                    )}
                  >
                    {tab.label}
                    {count !== null && <span className={cn("tabular-nums", selected ? "text-[#1246C8]" : "text-[#8C9AB0]")}>{count}</span>}
                  </button>
                );
              })}
            </div>
            <select value={type} onChange={(e) => update({ type: e.target.value })} aria-label="Certificate type" className="h-9 cursor-pointer rounded-full border border-[#DCE2EB] bg-white px-3 text-[12px] font-semibold text-[#10264B] outline-none focus:border-[#1246C8]">
              <option value="all">All types</option>
              {CERTIFICATE_TYPES.map((t) => <option key={t} value={t}>{TYPE_COPY[t].subtitle.replace("of ", "")}</option>)}
            </select>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })} aria-label="Sort" className="h-9 cursor-pointer rounded-full border border-[#DCE2EB] bg-white px-3 text-[12px] font-semibold text-[#10264B] outline-none focus:border-[#1246C8]">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
              <option value="completion">Completion date</option>
            </select>
            <Button variant="ghost" size="sm" onClick={exportCsv} disabled={exporting || pagination.total === 0}>
              {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileDown className="mr-1.5 h-4 w-4" />}
              Export
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
            <Button size="sm" variant="outline" onClick={load}>Retry</Button>
          </div>
        )}

        {/* Desktop table */}
        {/* `relative` keeps absolutely-positioned descendants (e.g. sr-only labels) inside the scroll box */}
        <div className="relative hidden overflow-x-auto md:block">
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-[#DCE2EB] bg-[#F5F7FB]/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">
                <th className="px-5 py-3">Recipient</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className={cn(loading && rows.length > 0 && "opacity-60 transition-opacity")}>
              {loading && rows.length === 0 &&
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} className="border-b border-[#DCE2EB]/70">
                    {Array.from({ length: 6 }, (__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-[#EEF2F8]" style={{ width: j === 0 ? "70%" : "55%" }} /></td>
                    ))}
                  </tr>
                ))}
              {rows.map((cert) => (
                <tr
                  key={cert.id}
                  onClick={() => update({ open: cert.id }, false)}
                  className="group cursor-pointer border-b border-[#DCE2EB]/70 transition-colors last:border-0 hover:bg-[#F5F7FB]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#10264B] to-[#1246C8] text-[11px] font-bold text-white">{initialsOf(cert.recipient.fullName)}</span>
                      <div className="min-w-0">
                        <p className="max-w-[200px] truncate text-sm font-semibold text-[#10264B]" title={cert.recipient.fullName}>{cert.recipient.fullName}</p>
                        <p className="max-w-[200px] truncate text-xs text-[#53647C]">{cert.recipient.email ?? (cert.recipient.studentIdNumber || "No email")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <p className="font-mono text-[13px] text-[#10264B]">{cert.serial}</p>
                    <p className="text-[11px] text-[#8C9AB0]" title={cert.issuedBy?.name ? `Issued by ${cert.issuedBy.name}` : undefined}>Issued {formatShortDate(cert.issueDate)}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="max-w-[210px] truncate text-[13px] text-[#172B49]" title={cert.programmes.join("\n")}>{cert.programmes[0]}</p>
                    <p className="text-[11px] text-[#8C9AB0]">
                      {TYPE_COPY[cert.type].subtitle.replace("of ", "")}
                      {cert.programmes.length > 1 && ` · +${cert.programmes.length - 1} more`}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-[#172B49]">{formatCertificateDate(cert.completionDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <CertificateStatusBadge status={cert.status} />
                    <p className="mt-1 text-[11px] tabular-nums text-[#8C9AB0]">{cert.stats.verifications} scan{cert.stats.verifications === 1 ? "" : "s"}</p>
                  </td>
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                      <button type="button" onClick={() => copyLink(cert)} title="Copy verification link" aria-label={`Copy verification link for ${cert.serial}`} className="rounded-full p-2 text-[#53647C] hover:bg-white hover:text-[#1246C8]">
                        {copiedId === cert.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => downloadRow(cert)} disabled={!!rowBusy} title="Download PDF" aria-label={`Download ${cert.serial} as PDF`} className="rounded-full p-2 text-[#53647C] hover:bg-white hover:text-[#1246C8] disabled:opacity-40">
                        {rowBusy === cert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </button>
                      <ChevronRight className="h-4 w-4 text-[#C3CCDA]" aria-hidden />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <ul className="divide-y divide-[#DCE2EB]/70 md:hidden">
          {rows.map((cert) => (
            <li key={cert.id}>
              <button type="button" onClick={() => update({ open: cert.id }, false)} className="flex w-full items-start gap-3 px-4 py-4 text-left active:bg-[#F5F7FB]">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#10264B] to-[#1246C8] text-[11px] font-bold text-white">{initialsOf(cert.recipient.fullName)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[#10264B]">{cert.recipient.fullName}</span>
                    <CertificateStatusBadge status={cert.status} className="shrink-0" />
                  </span>
                  <span className="mt-0.5 block font-mono text-[12px] text-[#53647C]">{cert.serial}</span>
                  <span className="mt-0.5 block truncate text-xs text-[#8C9AB0]">{cert.programmes.join(" · ")}</span>
                </span>
              </button>
            </li>
          ))}
          {loading && rows.length === 0 && Array.from({ length: 4 }, (_, i) => <li key={i} className="h-20 animate-pulse bg-white px-4" />)}
        </ul>

        {!loading && rows.length === 0 && !error && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Award className="h-6 w-6" />
            </div>
            {filtersActive ? (
              <>
                <p className="mt-4 text-[15px] font-bold text-[#10264B]">No certificates match these filters</p>
                <p className="mt-1 text-sm text-[#53647C]">Try a different search, or clear the filters.</p>
                <Button variant="outline" size="sm" className="mt-5" onClick={() => { setSearchInput(""); update({ q: null, status: null, type: null }); }}>
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="mt-4 text-[15px] font-bold text-[#10264B]">No certificates issued yet</p>
                <p className="mt-1 max-w-sm text-sm text-[#53647C]">Issue a single certificate in seconds, or upload a CSV to issue a whole cohort at once.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link to="/admin/dashboard/certificates/new" className="inline-flex h-10 items-center rounded-full bg-[#1246C8] px-5 text-sm font-semibold text-white shadow-glow hover:bg-[#0F3BAA]">
                    <Plus className="mr-1.5 h-4 w-4" /> Issue certificate
                  </Link>
                  <Button variant="outline" onClick={() => update({ bulk: "1" }, false)}><FileStack className="mr-2 h-4 w-4" />Bulk issue</Button>
                </div>
              </>
            )}
          </div>
        )}

        {pagination.total > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-[#DCE2EB] px-5 py-3.5 text-[13px] text-[#53647C]">
            <span className="tabular-nums">
              {from}–{to} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => update({ page: String(page - 1) }, false)} disabled={page <= 1 || loading} aria-label="Previous page" className="rounded-full p-2 hover:bg-[#F5F7FB] disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 tabular-nums">Page {page} of {pagination.pages}</span>
              <button type="button" onClick={() => update({ page: String(page + 1) }, false)} disabled={page >= pagination.pages || loading} aria-label="Next page" className="rounded-full p-2 hover:bg-[#F5F7FB] disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </AdminPanel>

      <CertificateDrawer
        certificateId={openId}
        onClose={() => update({ open: null }, false)}
        onChanged={onChanged}
        onOpen={(id) => update({ open: id }, false)}
      />
      <BulkIssueModal open={bulkOpen} onClose={() => update({ bulk: null }, false)} onIssued={load} />
    </AdminPageShell>
  );
}
