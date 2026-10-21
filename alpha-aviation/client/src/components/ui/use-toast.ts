import { createContext, useContext } from "react";

// Kept apart from the ToastProvider component so toast.tsx only exports
// components, which lets React Fast Refresh hot-reload it.

export type ToastType = "success" | "error" | "info";

export interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
