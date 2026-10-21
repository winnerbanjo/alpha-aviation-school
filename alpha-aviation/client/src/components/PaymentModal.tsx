import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { DollarSign, Copy, CheckCircle2, Upload } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { uploadPaymentReceipt } from '@/api'
import { asApiError } from "@/lib/errors";

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amountDue?: number
  userEmail?: string
}

export function PaymentModal({ isOpen, onClose, amountDue = 0, userEmail = '' }: PaymentModalProps) {
  const [copied, setCopied] = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount || 0)

  const bankDetails = {
    accountName: 'Alpha step links aviation school ltd',
    accountNumber: '1000485345',
    bank: 'Globus bank',
    reference: userEmail || 'STUDENT-REF'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })

  const handleReceiptUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      alert('Please upload an image file (JPG, PNG) or PDF')
      return
    }

    try {
      setUploadingReceipt(true)
      const encodedReceipt = await fileToDataUrl(file)
      await uploadPaymentReceipt(encodedReceipt)
      setReceiptUploaded(true)
      setTimeout(() => {
        setReceiptUploaded(false)
        onClose()
      }, 3000)
    } catch (caught) {
      const error = asApiError(caught);
      alert(error?.response?.data?.message || 'Failed to upload receipt. Please try again.')
    } finally {
      setUploadingReceipt(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bank Transfer Payment">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Payment Method Badge */}
        <div className="flex items-center gap-3 rounded-2xl bg-[#F2F6FF] p-3 ring-1 ring-[#DCE8FF]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-[#10264B]">
            Payment Method: Bank Transfer
          </p>
        </div>

        {/* Amount Due */}
        {amountDue > 0 && (
          <div className="rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Amount Due</p>
            <p className="text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {formatNaira(amountDue)}
            </p>
          </div>
        )}

        {/* Bank Details */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Bank Transfer Details</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Account Name</p>
                <p className="mt-0.5 text-sm font-semibold text-[#10264B]">{bankDetails.accountName}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.accountName)}
                className="h-8 w-8 shrink-0 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Account Number</p>
                <p className="mt-0.5 text-sm font-semibold text-[#10264B] tabular-nums">{bankDetails.accountNumber}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.accountNumber)}
                className="h-8 w-8 shrink-0 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Bank Name</p>
                <p className="mt-0.5 text-sm font-semibold text-[#10264B]">{bankDetails.bank}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.bank)}
                className="h-8 w-8 shrink-0 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Reference</p>
                <p className="mt-0.5 text-sm font-semibold text-[#10264B]">{bankDetails.reference}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.reference)}
                className="h-8 w-8 shrink-0 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Receipt */}
        {!receiptUploaded ? (
          <label className="block">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              disabled={uploadingReceipt}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleReceiptUpload(file)
                }
              }}
            />
            <div className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[#1246C8] px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg">
              <Upload className="w-4 h-4 mr-2" />
              {uploadingReceipt ? 'Uploading Receipt...' : 'Upload Receipt'}
            </div>
          </label>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-900 mb-1">
              Success!
            </p>
            <p className="text-xs text-emerald-700">
              Our team will verify your transfer shortly. You'll receive a confirmation email once processed.
            </p>
          </motion.div>
        )}

        <p className="text-xs text-[#53647C] text-center">
          After completing the transfer, upload your receipt above or email it to admin@alpha.com
        </p>
      </motion.div>
    </Modal>
  )
}
