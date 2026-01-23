import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { DollarSign, Copy, CheckCircle2, Upload } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amountDue?: number
  userEmail?: string
}

export function PaymentModal({ isOpen, onClose, amountDue = 0, userEmail = '' }: PaymentModalProps) {
  const [copied, setCopied] = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)

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

  const handleReceiptUpload = () => {
    setReceiptUploaded(true)
    setTimeout(() => {
      setReceiptUploaded(false)
      onClose()
    }, 3000)
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
              ${amountDue.toLocaleString()}.00
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
          <Button
            onClick={handleReceiptUpload}
            className="w-full rounded-lg bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Receipt
          </Button>
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
