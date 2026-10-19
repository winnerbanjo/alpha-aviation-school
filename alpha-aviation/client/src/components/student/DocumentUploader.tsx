import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { uploadDocument } from "@/api";
import { Upload, FileCheck, Image as ImageIcon } from "lucide-react";

export function DocumentUploader() {
  const { user, setUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (ID/Passport photo)");
      return;
    }

    try {
      setUploading(true);
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll create a mock URL
      const mockUrl = URL.createObjectURL(file);

      await uploadDocument(mockUrl);

      // Update user in store
      if (user) {
        setUser({ ...user, documentUrl: mockUrl });
      }

      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <span className="eyebrow text-[#1246C8]">Identity</span>
          <CardTitle>ID/Passport Upload</CardTitle>
          <CardDescription>
            Upload a photo of your ID or Passport for school records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.documentUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <FileCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-emerald-900">
                      Document Uploaded
                    </p>
                    <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Your ID/Passport has been submitted and verified
                  </p>
                </div>
              </div>
              <img
                src={user.documentUrl}
                alt="Uploaded document"
                className="mx-auto w-full max-w-md rounded-2xl border border-[#DCE2EB]"
              />
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? "border-[#1246C8] bg-[#1246C8]/5"
                  : "border-[#DCE2EB] bg-[#F5F7FB] hover:border-[#1246C8]/50"
              }`}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="mb-2 text-sm font-semibold text-[#10264B]">
                Drop your ID/Passport photo here
              </p>
              <p className="mb-4 text-xs text-[#53647C]">or click to browse</p>
              <input
                type="file"
                id="document-upload"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="document-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Select File"}
                </Button>
              </label>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
