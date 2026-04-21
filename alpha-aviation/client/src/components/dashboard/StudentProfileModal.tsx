import { useState, useEffect } from "react";
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
  CheckCircle2,
  Upload,
  Award,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { uploadCertificate } from "@/api";
import { useToast } from "@/components/ui/toast";

interface Student {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enrolledCourse?: string;
  paymentStatus: "Pending" | "Paid";
  amountDue: number;
  amountPaid?: number;
  enrollmentDate?: string;
  phone?: string;
  adminClearance?: boolean;
  status?: "active" | "banned" | "graduated" | "suspended";
  certificateUrl?: string;
  studentIdNumber?: string;
}

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onMarkAsPaid?: (studentId: string) => void;
  onWhatsAppReminder?: (student: Student) => void;
  onAdminClearanceChange?: (studentId: string, cleared: boolean) => void;
  onCertificateUploaded?: (studentId: string, url: string) => void;
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  onMarkAsPaid,
  onWhatsAppReminder,
  onAdminClearanceChange,
  onCertificateUploaded,
}: StudentProfileModalProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [localCertUrl, setLocalCertUrl] = useState<string | undefined>(
    student?.certificateUrl,
  );
  const [showReplace, setShowReplace] = useState(false);

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  useEffect(() => {
    if (student) {
      setLocalCertUrl(student.certificateUrl);
      setShowReplace(false);
    }
  }, [student]);

  if (!student) return null;

  // Graduated students are always treated as fully paid
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
        if (onCertificateUploaded) {
          onCertificateUploaded(student._id, data.secure_url);
        }
        toast("Certificate uploaded successfully!", "success");
      } else {
        toast("Upload failed — no URL returned from Cloudinary.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to upload certificate. Please try again.", "error");
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const isPdf =
    localCertUrl?.toLowerCase().includes(".pdf") ||
    localCertUrl?.toLowerCase().includes("/raw/") ||
    localCertUrl?.toLowerCase().includes("application/pdf");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      wide={true}
      title="Student Profile"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Student Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
            <div className="p-3 bg-[#0061FF]/10 rounded-full">
              <User className="w-6 h-6 text-[#0061FF]" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {student.firstName || ""} {student.lastName || ""}
                {!student.firstName && !student.lastName && "N/A"}
              </h3>
              <p className="text-sm text-slate-500">{student.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">
                  {student.email}
                </p>
              </div>
            </div>

            {student.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.phone}
                  </p>
                </div>
              </div>
            )}

            {student.enrolledCourse && (
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Enrolled Course</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.enrolledCourse}
                  </p>
                </div>
              </div>
            )}

            {student.enrollmentDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Enrollment Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(student.enrollmentDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      effectivePaymentStatus === "Paid" ? "success" : "warning"
                    }
                  >
                    {effectivePaymentStatus}
                  </Badge>
                  {effectivePaymentStatus === "Pending" && (
                    <span className="text-sm font-medium text-slate-900">
                      {formatNaira(student.amountDue)} due
                    </span>
                  )}
                  {effectivePaymentStatus === "Paid" && student.amountPaid && (
                    <span className="text-sm font-medium text-green-600">
                      {formatNaira(student.amountPaid)} paid
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Section - for graduated students */}
        {student.status === "graduated" && (
          <div className="pt-4 border-t border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-900">
                    Certificate
                  </span>
                </div>
                {localCertUrl && !showReplace && (
                  <button
                    onClick={() => setShowReplace(true)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0061FF] transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Replace
                  </button>
                )}
              </div>

              {/* Certificate Preview */}
              {localCertUrl && !showReplace ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg border border-green-200 bg-green-50 overflow-hidden"
                >
                  {isPdf ? (
                    <div className="flex items-center gap-3 p-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Award className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">
                          Certificate (PDF)
                        </p>
                        <p className="text-xs text-green-600 truncate">
                          {localCertUrl}
                        </p>
                      </div>
                      <a
                        href={localCertUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div className="relative w-full h-40 bg-slate-100">
                        <img
                          src={localCertUrl}
                          alt="Certificate preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <p className="text-xs text-green-700 font-medium">
                          ✓ Certificate uploaded
                        </p>
                        <a
                          href={localCertUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Full
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <>
                  {!localCertUrl && (
                    <p className="text-xs text-slate-500">
                      No certificate uploaded yet
                    </p>
                  )}

                  {/* Upload Control */}
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="certificateFile"
                      accept="image/*,.pdf"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="certificateFile"
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-md transition-colors cursor-pointer select-none ${
                        isUploading
                          ? "bg-[#0061FF]/60 cursor-not-allowed"
                          : "bg-[#0061FF] hover:bg-[#0052E6]"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {showReplace
                            ? "Upload New Certificate"
                            : "Upload Certificate"}
                        </>
                      )}
                    </label>
                    {showReplace && (
                      <button
                        onClick={() => setShowReplace(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors text-center"
                      >
                        Cancel
                      </button>
                    )}
                    <p className="text-xs text-slate-500">
                      Accepts PNG, JPG, or PDF — saved automatically to
                      Cloudinary
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
          {student.paymentStatus === "Pending" && onMarkAsPaid && (
            <Button
              onClick={() => {
                onMarkAsPaid(student._id);
                onClose();
              }}
              className="w-full rounded-lg bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-[1.02]"
            >
              Mark as Paid
            </Button>
          )}
          {onWhatsAppReminder && effectivePaymentStatus === "Pending" && (
            <Button
              variant="outline"
              onClick={() => {
                onWhatsAppReminder(student);
              }}
              className="w-full rounded-lg border-slate-200 hover:bg-slate-50 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send WhatsApp Reminder
            </Button>
          )}
        </div>
      </motion.div>
    </Modal>
  );
}
