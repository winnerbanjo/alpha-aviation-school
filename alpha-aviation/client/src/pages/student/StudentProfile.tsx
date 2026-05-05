import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { uploadDocument, getProfile } from "@/api";
import {
  User,
  Phone,
  FileText,
  Upload,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

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

    try {
      setSaving(true);
      await getProfile();
      setUser({
        ...user!,
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
    if (!file.type.startsWith("image/") && !file.type !== "application/pdf") {
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
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-500">
          Manage your personal information, security, and identity documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your name, phone, and bio.
                </CardDescription>
              </div>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Email cannot be changed. Contact admin for assistance.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="e.g. +234 800 000 0000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!editing}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
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
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-900">
              Identity Document
            </CardTitle>
            <CardDescription>
              Upload your ID card or passport photo for verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {user?.documentUrl ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">
                    Document Uploaded
                  </p>
                </div>
                <img
                  src={user.documentUrl}
                  alt="Identity document"
                  className="w-full rounded-lg border border-slate-200"
                />
                <div className="flex gap-3">
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
                    <div className="w-full rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer px-4 py-2.5 flex items-center justify-center text-sm font-medium text-slate-700">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingDocument ? "Uploading..." : "Replace"}
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
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
                  <div className="flex flex-col items-center justify-center py-8 cursor-pointer hover:opacity-80 transition-opacity">
                    <FileText className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {uploadingDocument
                        ? "Uploading..."
                        : "Upload ID or Passport"}
                    </p>
                    <p className="text-xs text-slate-500">
                      JPG, PNG, or PDF (Max 5MB)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-900">
            Change Password
          </CardTitle>
          <CardDescription>
            Update your portal password.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={changingPassword || !currentPassword || !newPassword}
              onClick={() => {
                toast("Password change not yet implemented on server", "error");
              }}
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
