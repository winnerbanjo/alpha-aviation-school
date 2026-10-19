import * as React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ isOpen, onClose, title, children, wide }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#07152E]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative z-50 mx-4 w-full overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-float ${wide ? "max-w-2xl" : "max-w-md"}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-[#DCE2EB] px-6 py-5">
            <h3 className="text-lg font-bold tracking-tighter text-[#10264B]">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
