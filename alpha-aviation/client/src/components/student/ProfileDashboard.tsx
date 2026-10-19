import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { updateStudentProfile } from "@/api";
import {
  User,
  Phone,
  FileText,
  Save,
  AlertCircle,
  Contact,
  Award,
  Lock,
} from "lucide-react";

export function ProfileDashboard() {
  const { user, setUser } = useAuthStore();
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [emergencyContact, setEmergencyContact] = useState(
    user?.emergencyContact || "",
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setEmergencyContact(user.emergencyContact || "");
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await updateStudentProfile(phone, bio, emergencyContact);
      setUser({ ...(user || {}), ...response.data.user });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIdCard = () => {
    if (!user) {
      return;
    }

    const studentName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student";
    const courseLabel =
      user.selectedCourses && user.selectedCourses.length > 0
        ? user.selectedCourses.slice(0, 2).join(" | ")
        : user.enrolledCourse || "Aviation Student";
    const studentIdNumber = user.studentIdNumber || "PENDING-ID";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="920" height="560" viewBox="0 0 920 560">
        <defs>
          <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width="920" height="560" rx="36" fill="url(#card)" />
        <rect x="42" y="42" width="836" height="476" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
        <text x="72" y="110" fill="#ffffff" font-size="34" font-family="Arial, sans-serif" font-weight="700">Alpha Step Links Aviation School</text>
        <text x="72" y="160" fill="#bfdbfe" font-size="18" font-family="Arial, sans-serif">Student Identification Card</text>
        <rect x="72" y="210" width="170" height="170" rx="20" fill="rgba(255,255,255,0.14)" />
        <text x="97" y="300" fill="#e2e8f0" font-size="34" font-family="Arial, sans-serif">ASL</text>
        <text x="280" y="250" fill="#bfdbfe" font-size="18" font-family="Arial, sans-serif">Student Name</text>
        <text x="280" y="290" fill="#ffffff" font-size="36" font-family="Arial, sans-serif" font-weight="700">${studentName}</text>
        <text x="280" y="345" fill="#bfdbfe" font-size="18" font-family="Arial, sans-serif">Student ID</text>
        <text x="280" y="382" fill="#ffffff" font-size="28" font-family="Arial, sans-serif">${studentIdNumber}</text>
        <text x="280" y="430" fill="#bfdbfe" font-size="18" font-family="Arial, sans-serif">Programme</text>
        <text x="280" y="467" fill="#ffffff" font-size="22" font-family="Arial, sans-serif">${courseLabel}</text>
      </svg>
    `;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${studentIdNumber}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 space-y-8"
    >
      <div>
        <span className="eyebrow text-[#1246C8]">Account</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-[#53647C]">
          Manage your personal information and contact details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details below
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                First Name
              </label>
              <input
                type="text"
                value={user?.firstName || ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] px-4 py-3 text-sm text-[#53647C] outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Last Name
              </label>
              <input
                type="text"
                value={user?.lastName || ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] px-4 py-3 text-sm text-[#53647C] outline-none"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] px-4 py-3 text-sm text-[#53647C] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              Student ID Number
            </label>
            <input
              type="text"
              value={user?.studentIdNumber || "Not assigned yet"}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] px-4 py-3 text-sm text-[#53647C] outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              <Phone className="w-4 h-4 text-[#1246C8]" />
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              <AlertCircle className="w-4 h-4 text-[#1246C8]" />
              Emergency Contact
            </label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
            />
            <p className="mt-1.5 text-xs text-[#8C9AB0]">
              Contact person in case of emergency
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              <FileText className="w-4 h-4 text-[#1246C8]" />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
            />
            <p className="mt-1.5 text-xs text-[#8C9AB0] tabular-nums">
              {bio.length}/500 characters
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">
            Downloads
          </CardTitle>
          <CardDescription>
            Download your student documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Student ID Card */}
          <Button
            onClick={handleDownloadIdCard}
            variant="secondary"
            className="w-full"
          >
            <Contact className="w-4 h-4 mr-2" />
            Download Student ID Card
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
