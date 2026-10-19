import { useEffect, useMemo, useState } from "react";
import { COURSE_CATALOG } from "@/data/courseCatalog";
import {
  createCourseResource,
  deleteCourseResource,
  getAdminResources,
  type CourseResourceItem,
} from "@/api";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Link as LinkIcon, Loader2, Trash2, Upload } from "lucide-react";
import { openResourceInBrowser } from "@/lib/openResource";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/AdminDashboardUI";

const inferResourceType = (file: File): CourseResourceItem["type"] => {
  if (file.type.includes("pdf")) return "pdf";
  if (file.type.includes("video")) return "video";
  // Word docs are no longer natively supported to enforce secure viewing.
  return "other";
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const uploadResource = async (file: File) => {
  const isPdf =
    file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "asl-academy");

  const resourceType = isPdf ? "image" : "auto";

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData },
  );
  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return data.secure_url as string;
};

export function AdminResources() {
  const { toast } = useToast();
  const [resources, setResources] = useState<CourseResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState(COURSE_CATALOG[0]?.title || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resourcesByCourse = useMemo(
    () =>
      COURSE_CATALOG.map((course) => ({
        courseTitle: course.title,
        resources: resources.filter(
          (resource) => resource.courseTitle === course.title,
        ),
      })),
    [resources],
  );

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await getAdminResources();
      setResources(response.data.resources);
    } catch (error) {
      console.error("Failed to load resources", error);
      toast("Failed to load resources", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !courseTitle || !title.trim()) {
      toast("Select a course, enter a title, and choose a file", "error");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadResource(selectedFile);
      const response = await createCourseResource({
        courseTitle,
        title: title.trim(),
        description: description.trim(),
        type: inferResourceType(selectedFile),
        size: formatFileSize(selectedFile.size),
        url,
      });

      setResources((current) => [response.data.resource, ...current]);
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      toast("Resource uploaded successfully", "success");
    } catch (error) {
      console.error("Resource upload failed", error);
      toast("Failed to upload resource", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      setDeletingId(resourceId);
      await deleteCourseResource(resourceId);
      setResources((current) =>
        current.filter((resource) => resource._id !== resourceId),
      );
      toast("Resource deleted", "success");
    } catch (error) {
      console.error("Failed to delete resource", error);
      toast("Failed to delete resource", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Course Resources"
        description="Upload and manage materials shown to students by enrolled programme."
        onRefresh={loadResources}
        refreshing={loading}
      />

      <AdminPanel>
        <CardHeader className="border-b border-[#DCE2EB] px-6 py-5">
          <CardTitle className="text-lg">Upload Resource</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              Programme
            </label>
            <select
              value={courseTitle}
              onChange={(event) => setCourseTitle(event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
            >
              {COURSE_CATALOG.map((course) => (
                <option key={course.title} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              Resource Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Module 1 Course Notes"
              className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Optional note for students"
              className="w-full resize-none rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
              File
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[#DCE2EB] bg-[#F5F7FB]/60 p-5 transition-colors hover:border-[#1246C8]/50 hover:bg-[#DCE8FF]/30">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#10264B]">
                    {selectedFile ? selectedFile.name : "Choose resource file"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#53647C]">
                    PDF, video, or image file (Word docs not supported for security).
                  </p>
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept="application/pdf,video/*,image/*"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />
            </label>
          </div>

          <div className="flex justify-end border-t border-[#DCE2EB] pt-5 lg:col-span-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Resource
            </Button>
          </div>
        </CardContent>
      </AdminPanel>

      <div className="space-y-4">
        {loading ? (
          <Card className="bg-white">
            <CardContent className="flex items-center justify-center gap-3 p-8 text-center text-sm text-[#53647C]">
              <Loader2 className="h-4 w-4 animate-spin text-[#1246C8]" />
              Loading resources...
            </CardContent>
          </Card>
        ) : (
          resourcesByCourse.map(({ courseTitle, resources }) => (
            <AdminPanel key={courseTitle}>
              <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] bg-[#F5F7FB]/60 px-6 py-4">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-bold tracking-tight text-[#10264B]">
                    {courseTitle}
                  </h2>
                  <p className="mt-0.5 text-xs tabular-nums text-[#53647C]">
                    {resources.length} uploaded resource
                    {resources.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 border-transparent bg-[#DCE8FF] text-[#1246C8] hover:bg-[#DCE8FF]">
                  Programme
                </Badge>
              </div>
              <div className="p-0">
                {resources.length === 0 ? (
                  <div className="px-6 py-5 text-sm text-[#8C9AB0]">
                    No resources uploaded for this programme.
                  </div>
                ) : (
                  resources.map((resource, index) => (
                    <div
                      key={resource._id}
                      className={`flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#F5F7FB] ${
                        index !== resources.length - 1
                          ? "border-b border-[#DCE2EB]/70"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCE8FF] text-[#1246C8]">
                          <FileText className="w-[18px] h-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#10264B]">
                            {resource.title}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#53647C]">
                            {resource.type.toUpperCase()}
                            {resource.size ? ` · ${resource.size}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResourceInBrowser(resource.url)}
                        >
                          <LinkIcon className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resource._id)}
                          disabled={deletingId === resource._id}
                          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          {deletingId === resource._id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminPanel>
          ))
        )}
      </div>
    </AdminPageShell>
  );
}
