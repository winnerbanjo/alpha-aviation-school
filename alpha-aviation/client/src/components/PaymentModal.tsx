import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { DollarSign, Copy, CheckCircle2, Upload } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { uploadPaymentReceipt } from '@/api'

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
    accountName: 'Alpha Step Links Aviation School',
    accountNumber: '1234567890',
    bank: 'Your Bank Name',
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
    } catch (error: any) {
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
        <div className="flex items-center gap-2 p-3 bg-[#0061FF]/10 rounded-lg">
          <DollarSign className="w-5 h-5 text-[#0061FF]" />
          <p className="text-sm font-bold text-slate-900">
            Payment Method: Bank Transfer
          </p>
        </div>

        {/* Amount Due */}
        {amountDue > 0 && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Amount Due</p>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {formatNaira(amountDue)}
            </p>
          </div>
        )}

        {/* Bank Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Bank Transfer Details</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">Account Name</p>
                <p className="text-sm font-medium text-slate-900">{bankDetails.accountName}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.accountName)}
                className="h-8 w-8 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">Account Number</p>
                <p className="text-sm font-medium text-slate-900">{bankDetails.accountNumber}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.accountNumber)}
                className="h-8 w-8 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">Bank Name</p>
                <p className="text-sm font-medium text-slate-900">{bankDetails.bank}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.bank)}
                className="h-8 w-8 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">Reference</p>
                <p className="text-sm font-medium text-slate-900">{bankDetails.reference}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(bankDetails.reference)}
                className="h-8 w-8 p-0"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
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
            <div className="w-full rounded-lg bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-[1.02] cursor-pointer px-4 py-2.5 flex items-center justify-center">
              <Upload className="w-4 h-4 mr-2" />
              {uploadingReceipt ? 'Uploading Receipt...' : 'Upload Receipt'}
            </div>
          </label>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-50 border border-green-200 rounded-lg text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900 mb-1">
              Success!
            </p>
            <p className="text-xs text-green-700">
              Our team will verify your transfer shortly. You'll receive a confirmation email once processed.
            </p>
          </motion.div>
        )}

        <p className="text-xs text-slate-500 text-center">
          After completing the transfer, upload your receipt above or email it to admin@alpha.com
        </p>
      </motion.div>
    </Modal>
  )
}
