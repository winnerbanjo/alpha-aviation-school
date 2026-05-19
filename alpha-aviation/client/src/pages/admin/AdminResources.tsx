import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import { FileText, Link as LinkIcon, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { openResourceInBrowser } from "@/lib/openResource";

const inferResourceType = (file: File): CourseResourceItem["type"] => {
  if (file.type.includes("pdf")) return "pdf";
  if (file.type.includes("video")) return "video";
  if (
    file.type.includes("word") ||
    file.name.toLowerCase().endsWith(".doc") ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    return "doc";
  }
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Course Resources
          </h1>
          <p className="text-slate-500">
            Upload and manage materials shown to students by enrolled programme.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadResources}
          disabled={loading}
          className="rounded-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg text-slate-900">Upload Resource</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Programme
            </label>
            <select
              value={courseTitle}
              onChange={(event) => setCourseTitle(event.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {COURSE_CATALOG.map((course) => (
                <option key={course.title} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resource Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Module 1 Course Notes"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Optional note for students"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              File
            </label>
            <label className="flex items-center justify-between gap-3 border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Upload className="w-5 h-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {selectedFile ? selectedFile.name : "Choose resource file"}
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, document, video, image, or other supported Cloudinary file.
                  </p>
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />
            </label>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
      </Card>

      <div className="space-y-4">
        {loading ? (
          <Card className="border-slate-200">
            <CardContent className="p-8 text-center text-sm text-slate-500">
              Loading resources...
            </CardContent>
          </Card>
        ) : (
          resourcesByCourse.map(({ courseTitle, resources }) => (
            <Card key={courseTitle} className="border-slate-200 overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {courseTitle}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {resources.length} uploaded resource
                    {resources.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none">
                  Programme
                </Badge>
              </div>
              <CardContent className="p-0">
                {resources.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500">
                    No resources uploaded for this programme.
                  </div>
                ) : (
                  resources.map((resource, index) => (
                    <div
                      key={resource._id}
                      className={`p-4 flex items-center justify-between gap-4 ${
                        index !== resources.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <FileText className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {resource.title}
                          </p>
                          <p className="text-xs text-slate-500">
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
                          className="text-red-700 border-red-200 hover:bg-red-50"
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
