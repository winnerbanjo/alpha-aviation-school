import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/lib/phone";
import { useToast } from "@/components/ui/toast";
import { uploadDocument, updateStudentProfile } from "@/api";
import {
  User,
  FileText,
  Upload,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export function StudentProfile() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!firstName || !lastName) {
      toast("First name and last name are required", "error");
      return;
    }
    if (phone && !isValidPhoneNumber(phone)) {
      toast("Please enter a valid phone number", "error");
      return;
    }

    try {
      setSaving(true);
      const response = await updateStudentProfile(
        phone,
        bio,
        undefined,
        firstName,
        lastName,
      );
      setUser({
        ...user!,
        ...response?.data?.user,
        firstName,
        lastName,
        phone,
        bio,
      });
      toast("Profile updated successfully", "success");
      setEditing(false);
    } catch (err: any) {
      toast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast("Please upload an image or PDF file", "error");
      return;
    }

    try {
      setUploadingDocument(true);
      const encoded = await fileToDataUrl(file);
      const response = await uploadDocument(encoded);

      if (user && response?.data) {
        setUser({
          ...user,
          documentUrl: response.data.documentUrl,
          status: response.data.status || user.status,
        });
      }

      toast("Document uploaded successfully", "success");
    } catch (error: any) {
      toast(
        error.response?.data?.message || "Failed to upload document",
        "error",
      );
    } finally {
      setUploadingDocument(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div>
        <span className="eyebrow text-[#1246C8]">Account</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-[#53647C]">
          Manage your personal information, security credentials, and
          verification identity documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal Info */}
        <div className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
          <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#10264B]">
                  Personal Information
                </h3>
                <p className="mt-0.5 text-[13px] text-[#53647C]">
                  Update your name, contact phone, and profile bio.
                </p>
              </div>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="shrink-0"
              >
                Edit
              </Button>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!editing}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm font-medium text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10 disabled:bg-[#F5F7FB] disabled:text-[#53647C]"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!editing}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm font-medium text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10 disabled:bg-[#F5F7FB] disabled:text-[#53647C]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] px-4 py-3 text-sm font-medium text-[#53647C] outline-none transition"
              />
              <p className="mt-1.5 text-[11px] text-[#8C9AB0]">
                Email address cannot be changed. Contact registry desk for
                assistance.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Phone Number
              </label>
              <PhoneNumberInput
                value={phone}
                onChange={setPhone}
                disabled={!editing}
                inputClassName="font-medium"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Profile Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!editing}
                rows={3}
                className="w-full resize-none rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm font-medium leading-relaxed text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10 disabled:bg-[#F5F7FB] disabled:text-[#53647C]"
                placeholder="Tell us about yourself..."
              />
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 gap-1.5"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFirstName(user?.firstName || "");
                    setLastName(user?.lastName || "");
                    setPhone(user?.phone || "");
                    setBio(user?.bio || "");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Identity Document */}
        <div className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
          <div className="flex items-center gap-3 border-b border-[#DCE2EB] px-6 py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#10264B]">
                Identity Document
              </h3>
              <p className="mt-0.5 text-[13px] text-[#53647C]">
                Upload your ID card or passport photo for clearance verification.
              </p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {user?.documentUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-[13px] font-semibold">
                    Verification Document Uploaded Successfully
                  </span>
                </div>
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB]">
                  <img
                    src={user.documentUrl}
                    alt="Identity document"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload(file);
                      }}
                      className="hidden"
                      disabled={uploadingDocument}
                    />
                    <div className="flex w-full cursor-pointer items-center justify-center rounded-full border border-[#10264B]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8]">
                      <Upload className="w-4 h-4 mr-2" />
                      <span>
                        {uploadingDocument
                          ? "Uploading..."
                          : "Replace Uploaded Document"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#DCE2EB] bg-[#F5F7FB] p-4 transition-colors hover:border-[#1246C8]">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(file);
                    }}
                    className="hidden"
                    disabled={uploadingDocument}
                  />
                  <div className="group flex cursor-pointer flex-col items-center justify-center py-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1246C8] shadow-subtle ring-1 ring-[#DCE2EB] transition-transform duration-300 group-hover:scale-105">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-[#10264B]">
                      {uploadingDocument
                        ? "Uploading..."
                        : "Upload Identity ID / Passport"}
                    </p>
                    <p className="text-xs text-[#8C9AB0]">
                      JPG, PNG, or PDF formats up to 5MB
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Security & Credentials */}
      <div className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
        <div className="flex items-center gap-3 border-b border-[#DCE2EB] px-6 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-[#10264B]">
              Change Password
            </h3>
            <p className="mt-0.5 text-[13px] text-[#53647C]">
              Update your portal security password key credentials.
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="max-w-md space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 pr-11 text-sm font-medium text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9AB0] transition-colors hover:text-[#1246C8]"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 pr-11 text-sm font-medium text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9AB0] transition-colors hover:text-[#1246C8]"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="gap-1.5"
              disabled={changingPassword || !currentPassword || !newPassword}
              onClick={() => {
                toast("Password change not yet implemented on server", "error");
              }}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>
                {changingPassword ? "Updating..." : "Update Password"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
