import * as React from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-100 z-50">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
