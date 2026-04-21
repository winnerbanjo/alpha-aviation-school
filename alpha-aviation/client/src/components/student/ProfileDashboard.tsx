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
    >
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0061FF]/10 rounded-lg">
              <User className="w-5 h-5 text-[#0061FF]" />
            </div>
            <div>
              <CardTitle className="text-slate-900 tracking-tighter">
                Profile Settings
              </CardTitle>
              <CardDescription className="text-slate-500">
                Update your personal information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={user?.firstName || ""}
                disabled
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={user?.lastName || ""}
                disabled
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Student ID Number
            </label>
            <input
              type="text"
              value={user?.studentIdNumber || "Not assigned yet"}
              disabled
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-900 mb-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-900 mb-2">
              <AlertCircle className="w-4 h-4" />
              Emergency Contact
            </label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
            />
            <p className="text-xs text-slate-400 mt-1">
              Contact person in case of emergency
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-900 mb-2">
              <FileText className="w-4 h-4" />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {bio.length}/500 characters
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white shadow-sm transition-all duration-300 hover:scale-105"
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card className="border-slate-200/50 mt-6">
        <CardHeader>
          <CardTitle className="text-slate-900 tracking-tighter">
            Downloads
          </CardTitle>
          <CardDescription className="text-slate-500">
            Download your student documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Student ID Card */}
          <Button
            onClick={handleDownloadIdCard}
            className="action-button w-full"
          >
            <Contact className="w-4 h-4 mr-2" />
            Download Student ID Card
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
