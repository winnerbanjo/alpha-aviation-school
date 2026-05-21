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
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Profile Settings
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-1">
          Manage your personal information, security credentials, and
          verification identity documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Personal Info */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personal Information
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Update your name, contact phone, and profile bio.
              </p>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs py-1.5 px-3.5 transition-all shadow-sm"
              >
                Edit
              </Button>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm bg-slate-50/50 text-slate-500 cursor-not-allowed transition-all font-bold"
              />
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                Email address cannot be changed. Contact registry desk for
                assistance.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                Phone Number
              </label>
              <PhoneNumberInput
                value={phone}
                onChange={setPhone}
                disabled={!editing}
                inputClassName="py-2.5 rounded-2xl focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                Profile Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!editing}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50/50 disabled:text-slate-500 resize-none font-bold text-slate-800 leading-relaxed"
                placeholder="Tell us about yourself..."
              />
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold py-2.5 text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs py-2.5 px-4 transition-all"
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
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">
              Identity Document
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Upload your ID card or passport photo for clearance verification.
            </p>
          </div>
          <div className="p-6 space-y-4">
            {user?.documentUrl ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold">
                    Verification Document Uploaded Successfully
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 aspect-video bg-slate-50 flex items-center justify-center">
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
                    <div className="w-full rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer px-4 py-2.5 flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
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
              <div className="p-4 bg-slate-50/60 border border-slate-200/80 border-dashed rounded-3xl">
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
                  <div className="flex flex-col items-center justify-center py-8 cursor-pointer hover:opacity-85 transition-opacity group">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 mb-3 group-hover:scale-105 transition-transform duration-300">
                      <FileText className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">
                      {uploadingDocument
                        ? "Uploading..."
                        : "Upload Identity ID / Passport"}
                    </p>
                    <p className="text-xs text-slate-400">
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
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">
            Change Password
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Update your portal security password key credentials.
          </p>
        </div>
        <div className="p-6">
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              <label className="text-xs font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800"
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold py-2.5 text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
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
