import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import type { CourseResourceItem } from "@/api";

// PDF.js worker setup for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface SecureViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resource: CourseResourceItem | null;
}

export function SecureViewer({ isOpen, onClose, resource }: SecureViewerProps) {
  const { user } = useAuthStore();
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [obscured, setObscured] = useState(false);

  // Anti-screenshot & focus tracking
  useEffect(() => {
    if (!isOpen) return;

    const handleBlur = () => setObscured(true);
    const handleFocus = () => setObscured(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        setObscured(true);
        setTimeout(() => setObscured(false), 3000);
      }
      // Mac combos: Cmd + Shift + 3/4/5
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) {
        setObscured(true);
        setTimeout(() => setObscured(false), 3000);
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopy);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopy);
    };
  }, [isOpen]);

  // Reset page when resource changes
  useEffect(() => {
    setPageNumber(1);
    setNumPages(undefined);
  }, [resource]);

  if (!isOpen || !resource) return null;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return createPortal(
    <div className="fixed inset-0 w-full z-[9999] h-screen top-0 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/50 border-b border-white/10 flex items-center justify-between px-6 z-10">
        <div className="flex flex-col">
          <h2 className="text-white font-bold truncate max-w-xl">{resource.title}</h2>
          <p className="text-xs text-white/50">Protected view-only mode</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full pt-16 flex flex-col items-center justify-center overflow-auto">
        {/* Dynamic Watermark */}
        <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden flex flex-wrap justify-center items-center opacity-[0.03] rotate-[-30deg]">
          {Array.from({ length: 150 }).map((_, i) => (
            <div key={i} className="text-white font-black text-2xl p-8 whitespace-nowrap">
              {user?.email} · {user?.studentIdNumber || "ALPHA-AVIATION"}
            </div>
          ))}
        </div>

        {/* The Document/Media */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {resource.type === "pdf" ? (
            <div className="flex flex-col items-center h-full w-full overflow-y-auto pb-24 pt-4">
              <Document
                file={resource.url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center text-white/50 gap-4 mt-20">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Loading secure document...</p>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center text-rose-400 gap-4 mt-20">
                    <AlertTriangle className="w-8 h-8" />
                    <p>Failed to load document securely.</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-2xl"
                  width={Math.min(window.innerWidth * 0.9, 1000)}
                />
              </Document>
            </div>
          ) : resource.type === "video" ? (
            <video
              src={resource.url}
              controls
              controlsList="nodownload"
              className="max-w-[90%] max-h-[80%] rounded-xl shadow-2xl bg-black"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <img
              src={resource.url}
              alt={resource.title}
              className="max-w-[90%] max-h-[80%] rounded-xl shadow-2xl object-contain pointer-events-none"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>

        {/* PDF Paginator */}
        {resource.type === "pdf" && numPages && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-6 z-30 shadow-xl">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => p - 1)}
              className="p-1.5 text-white hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium">
              Page {pageNumber} of {numPages}
            </span>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(p => p + 1)}
              className="p-1.5 text-white hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Obscured Overlay (Anti-screenshot) */}
      <AnimatePresence>
        {obscured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white"
          >
            <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
            <h2 className="text-2xl font-black mb-2">Content Protected</h2>
            <p className="text-slate-400 text-center max-w-md">
              Screenshots, recording, and leaving the window are restricted for protected course materials.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
