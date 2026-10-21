import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { ToastContext, type ToastType } from "./use-toast";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`flex items-start gap-3 px-4 py-3.5 rounded-card shadow-elevated border pointer-events-auto min-w-[300px] max-w-sm ${
                t.type === "success"
                  ? "bg-white border-emerald-200 text-[#10264B]"
                  : t.type === "error"
                    ? "bg-white border-red-200 text-[#10264B]"
                    : "bg-white border-[#DCE2EB] text-[#10264B]"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {t.type === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {t.type === "error" && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                {t.type === "info" && (
                  <AlertCircle className="w-5 h-5 text-[#1246C8]" />
                )}
              </span>
              <p className="text-sm font-medium leading-snug flex-1">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
