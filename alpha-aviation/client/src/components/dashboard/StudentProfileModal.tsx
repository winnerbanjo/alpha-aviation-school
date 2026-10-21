import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  BookOpen,
  MessageCircle,
  Upload,
  Award,
  ExternalLink,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { uploadCertificate, getStudentCourseTracks, type CourseTrackItem } from "@/api";
import { useToast } from "@/components/ui/use-toast";
import type { Student } from "@/hooks/useAdminData";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onMarkAsPaid?: (studentId: string) => void;
  onWhatsAppReminder?: (student: Student) => void;
  onAdminClearanceChange?: (studentId: string, cleared: boolean) => void;
  onCertificateUploaded?: (studentId: string, url: string) => void;
  onUpdateWeekProgress?: (
    trackId: string,
    data: {
      week1Progress?: number;
      week2Progress?: number;
      week3Progress?: number;
      week4Progress?: number;
    },
  ) => Promise<void>;
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  onMarkAsPaid,
  onWhatsAppReminder,
  onCertificateUploaded,
  onUpdateWeekProgress,
}: StudentProfileModalProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [localCertUrl, setLocalCertUrl] = useState<string | undefined>(student?.certificateUrl);
  const [showReplace, setShowReplace] = useState(false);
  const [tracks, setTracks] = useState<CourseTrackItem[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [trackExpanded, setTrackExpanded] = useState(false);
  // Local editable progress state per track
  const [progressEdits, setProgressEdits] = useState<Record<string, { w1: number; w2: number; w3: number; w4: number }>>({});
  const [savingTrack, setSavingTrack] = useState<string | null>(null);

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount || 0);

  useEffect(() => {
    if (student) {
      setLocalCertUrl(student.certificateUrl);
      setShowReplace(false);
      setTrackExpanded(false);
    }
  }, [student]);

  // Fetch course tracks whenever modal opens with a Paid student
  const fetchTracks = useCallback(async () => {
    if (!student?._id || student.paymentStatus !== "Paid") return;
    setLoadingTracks(true);
    try {
      const res = await getStudentCourseTracks(student._id);
      if (res?.success) {
        setTracks(res.data.tracks);
        // Seed editable state from current values
        const edits: typeof progressEdits = {};
        res.data.tracks.forEach((t) => {
          edits[t._id] = { w1: t.week1Progress, w2: t.week2Progress, w3: t.week3Progress, w4: t.week4Progress };
        });
        setProgressEdits(edits);
      }
    } catch {
      // Non-fatal
    } finally {
      setLoadingTracks(false);
    }
  }, [student?._id, student?.paymentStatus]);

  useEffect(() => {
    if (isOpen) fetchTracks();
  }, [isOpen, fetchTracks]);

  if (!student) return null;

  const isGraduated = student.status === "graduated";
  const effectivePaymentStatus = isGraduated ? "Paid" : student.paymentStatus;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "asl-academy");
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData },
      );
      const data = await response.json();
      if (data.secure_url) {
        await uploadCertificate(student._id, data.secure_url);
        setLocalCertUrl(data.secure_url);
        setShowReplace(false);
        if (onCertificateUploaded) onCertificateUploaded(student._id, data.secure_url);
        toast("Certificate uploaded successfully!", "success");
      } else {
        toast("Upload failed — no URL returned from Cloudinary.", "error");
      }
    } catch {
      toast("Failed to upload certificate. Please try again.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveProgress = async (trackId: string) => {
    if (!onUpdateWeekProgress) return;
    const edit = progressEdits[trackId];
    if (!edit) return;
    setSavingTrack(trackId);
    try {
      await onUpdateWeekProgress(trackId, {
        week1Progress: edit.w1,
        week2Progress: edit.w2,
        week3Progress: edit.w3,
        week4Progress: edit.w4,
      });
      await fetchTracks(); // refresh after save
    } finally {
      setSavingTrack(null);
    }
  };

  const isPdf =
    localCertUrl?.toLowerCase().includes(".pdf") ||
    localCertUrl?.toLowerCase().includes("/raw/") ||
    localCertUrl?.toLowerCase().includes("application/pdf");

  return (
    <Modal isOpen={isOpen} onClose={onClose} wide={true} title="Student Profile">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Student Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-5 border-b border-[#DCE2EB]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tighter text-[#10264B]">
                {student.firstName || ""} {student.lastName || ""}
                {!student.firstName && !student.lastName && "N/A"}
              </h3>
              <p className="text-sm text-[#53647C]">{student.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#8C9AB0]" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Email</p>
                <p className="text-sm font-medium text-[#10264B]">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#8C9AB0]" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Phone</p>
                <p className={`text-sm font-medium ${student.phone ? "text-[#10264B]" : "text-amber-700"}`}>
                  {student.phone || "Not added yet"}
                </p>
              </div>
            </div>

            {student.enrolledCourse && (
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#8C9AB0]" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Enrolled Course</p>
                  <p className="text-sm font-medium text-[#10264B]">{student.enrolledCourse}</p>
                </div>
              </div>
            )}

            {student.enrollmentDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#8C9AB0]" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Enrollment Date</p>
                  <p className="text-sm font-medium text-[#10264B]">
                    {new Date(student.enrollmentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-[#8C9AB0]" />
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={effectivePaymentStatus === "Paid" ? "success" : "warning"}
                    className={effectivePaymentStatus === "Paid" ? "ring-1 ring-emerald-600/15" : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15 hover:bg-amber-50"}
                  >
                    {effectivePaymentStatus}
                  </Badge>
                  {effectivePaymentStatus === "Pending" && (
                    <span className="text-sm font-medium tabular-nums text-[#10264B]">{formatNaira(student.amountDue)} due</span>
                  )}
                  {effectivePaymentStatus === "Paid" && student.amountPaid && (
                    <span className="text-sm font-medium tabular-nums text-emerald-700">{formatNaira(student.amountPaid)} paid</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Course Tracking Section ─────────────────────────────────────── */}
        {student.paymentStatus === "Paid" && (
          <div className="border-t border-[#DCE2EB] pt-4">
            <button
              onClick={() => setTrackExpanded((v) => !v)}
              className="flex items-center justify-between w-full text-left group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1246C8]" />
                <span className="text-sm font-bold tracking-tight text-[#10264B]">
                  Course Tracking
                </span>
                {tracks.length > 0 && (
                  <span className="text-[11px] font-semibold bg-[#DCE8FF] text-[#1246C8] px-2.5 py-0.5 rounded-full">
                    {tracks.length} track{tracks.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {trackExpanded ? <ChevronUp className="w-4 h-4 text-[#8C9AB0] group-hover:text-[#1246C8]" /> : <ChevronDown className="w-4 h-4 text-[#8C9AB0] group-hover:text-[#1246C8]" />}
            </button>

            <AnimatePresence>
              {trackExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-5">
                    {loadingTracks ? (
                      <div className="flex items-center gap-2 text-sm text-[#53647C]">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading tracks...
                      </div>
                    ) : tracks.length === 0 ? (
                      <p className="text-xs text-[#53647C]">No course tracks found for this student.</p>
                    ) : (
                      tracks.map((track) => {
                        const edit = progressEdits[track._id] ?? { w1: track.week1Progress, w2: track.week2Progress, w3: track.week3Progress, w4: track.week4Progress };
                        const isSaving = savingTrack === track._id;

                        return (
                          <div key={track._id} className="rounded-2xl border border-[#DCE2EB] p-4 space-y-3 bg-[#F5F7FB]">
                            {/* Track header */}
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-[#10264B] leading-tight">{track.courseTitle}</p>
                              <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ${
                                track.status === "completed" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                                : track.status === "expired" ? "bg-red-50 text-red-700 ring-red-600/15"
                                : "bg-[#DCE8FF] text-[#1246C8] ring-[#1246C8]/10"
                              }`}>
                                {track.status === "active" ? `Wk ${track.currentWeek}/4` : track.status}
                              </span>
                            </div>

                            {/* Overall bar */}
                            <div>
                              <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C] mb-1.5">
                                <span>Overall Progress</span>
                                <span className="text-[#1246C8] tabular-nums">{track.overallProgress}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#DCE2EB] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#1246C8] to-[#5B86FF] rounded-full transition-all duration-700"
                                  style={{ width: `${track.overallProgress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-[#8C9AB0] mt-1.5 tabular-nums">
                                <span>{new Date(track.startDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
                                <span>{track.daysRemaining > 0 ? `${track.daysRemaining}d left` : "Ended"}</span>
                                <span>{new Date(track.endDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
                              </div>
                            </div>

                            {/* Per-week admin sliders */}
                            {onUpdateWeekProgress && (
                              <div className="space-y-2 pt-3 border-t border-[#DCE2EB]">
                                <p className="text-[10px] font-semibold text-[#53647C] uppercase tracking-[0.16em]">Admin: Set Weekly Progress</p>
                                {(["w1", "w2", "w3", "w4"] as const).map((key, wi) => (
                                  <div key={key} className="flex items-center gap-3">
                                    <span className={`text-[11px] font-semibold w-12 shrink-0 ${wi + 1 === track.currentWeek ? "text-[#1246C8]" : "text-[#8C9AB0]"}`}>
                                      Wk {wi + 1}
                                    </span>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      step={5}
                                      value={edit[key]}
                                      onChange={(e) =>
                                        setProgressEdits((prev) => ({
                                          ...prev,
                                          [track._id]: { ...edit, [key]: Number(e.target.value) },
                                        }))
                                      }
                                      className="flex-1 h-1.5 accent-[#1246C8] cursor-pointer"
                                    />
                                    <span className="text-[11px] font-semibold text-[#10264B] w-8 text-right tabular-nums">{edit[key]}%</span>
                                  </div>
                                ))}
                                <Button
                                  size="sm"
                                  disabled={isSaving}
                                  onClick={() => handleSaveProgress(track._id)}
                                  className="mt-2 w-full"
                                >
                                  {isSaving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</> : "Save Progress"}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Verifiable certificate generator, prefilled with this student */}
        <div className="pt-4 border-t border-[#DCE2EB]">
          <Link
            to={`/admin/dashboard/certificates/new?student=${student._id}`}
            className="group flex items-center gap-3 rounded-2xl border border-[#1246C8]/20 bg-[#F2F6FF] p-3.5 transition-colors hover:border-[#1246C8]/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-white">
              <BadgeCheck className="w-5 h-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#10264B]">Generate verifiable certificate</span>
              <span className="block truncate text-xs text-[#53647C]">Prefilled with this student's name and programmes · QR verified</span>
            </span>
            <ChevronRight className="w-4 h-4 shrink-0 text-[#1246C8] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Certificate Section */}
        {student.status === "graduated" && (
          <div className="pt-4 border-t border-[#DCE2EB]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold tracking-tight text-[#10264B]">Certificate</span>
                </div>
                {localCertUrl && !showReplace && (
                  <button onClick={() => setShowReplace(true)} className="flex items-center gap-1 text-xs font-semibold text-[#53647C] hover:text-[#1246C8] transition-colors">
                    <RefreshCw className="w-3 h-3" /> Replace
                  </button>
                )}
              </div>
              {localCertUrl && !showReplace ? (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-emerald-200 bg-emerald-50 overflow-hidden">
                  {isPdf ? (
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100"><Award className="w-5 h-5 text-emerald-700" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-900 truncate">Certificate (PDF)</p>
                        <p className="text-xs text-emerald-700 truncate">{localCertUrl}</p>
                      </div>
                      <a href={localCertUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#1246C8] hover:bg-[#0F3BAA] rounded-full transition-colors shrink-0">
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div className="relative w-full h-40 bg-[#F5F7FB]">
                        <img src={localCertUrl} alt="Certificate preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <p className="text-xs text-emerald-700 font-semibold">✓ Certificate uploaded</p>
                        <a href={localCertUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#1246C8] hover:bg-[#0F3BAA] rounded-full transition-colors">
                          <ExternalLink className="w-3 h-3" /> View Full
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <>
                  {!localCertUrl && <p className="text-xs text-[#53647C]">No certificate uploaded yet</p>}
                  <div className="flex flex-col gap-2">
                    <input type="file" id="certificateFile" accept="image/*,.pdf" className="hidden" disabled={isUploading} onChange={handleFileChange} />
                    <label htmlFor="certificateFile" className={`flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all cursor-pointer select-none ${isUploading ? "bg-[#1246C8]/60 cursor-not-allowed" : "bg-[#1246C8] shadow-glow hover:bg-[#0F3BAA] hover:shadow-glow-lg"}`}>
                      {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />{showReplace ? "Upload New Certificate" : "Upload Certificate"}</>}
                    </label>
                    {showReplace && <button onClick={() => setShowReplace(false)} className="text-xs font-semibold text-[#53647C] hover:text-[#10264B] transition-colors text-center">Cancel</button>}
                    <p className="text-xs text-[#8C9AB0]">Accepts PNG, JPG, or PDF — saved automatically to Cloudinary</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#DCE2EB]">
          {student.paymentStatus === "Pending" && onMarkAsPaid && (
            <Button onClick={() => { onMarkAsPaid(student._id); onClose(); }} className="w-full">
              Mark as Paid
            </Button>
          )}
          {onWhatsAppReminder && effectivePaymentStatus === "Pending" && (
            <Button variant="outline" onClick={() => { onWhatsAppReminder(student); }} className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" /> Send WhatsApp Reminder
            </Button>
          )}
        </div>
      </motion.div>
    </Modal>
  );
}
