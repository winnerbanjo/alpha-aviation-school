import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Calendar, DollarSign, BookOpen, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Student {
  _id: string
  email: string
  firstName?: string
  lastName?: string
  enrolledCourse?: string
  paymentStatus: 'Pending' | 'Paid'
  amountDue: number
  amountPaid?: number
  enrollmentDate?: string
  phone?: string
}

interface StudentProfileModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  onMarkAsPaid?: (studentId: string) => void
  onWhatsAppReminder?: (student: Student) => void
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  onMarkAsPaid,
  onWhatsAppReminder
}: StudentProfileModalProps) {
  if (!student) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Profile">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Student Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
            <div className="p-3 bg-[#0061FF]/10 rounded-full">
              <User className="w-6 h-6 text-[#0061FF]" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {student.firstName || ''} {student.lastName || ''}
                {!student.firstName && !student.lastName && 'N/A'}
              </h3>
              <p className="text-sm text-slate-500">{student.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">{student.email}</p>
              </div>
            </div>

            {student.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{student.phone}</p>
                </div>
              </div>
            )}

            {student.enrolledCourse && (
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Enrolled Course</p>
                  <p className="text-sm font-medium text-slate-900">{student.enrolledCourse}</p>
                </div>
              </div>
            )}

            {student.enrollmentDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Enrollment Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(student.enrollmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={student.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                    {student.paymentStatus}
                  </Badge>
                  {student.paymentStatus === 'Pending' && (
                    <span className="text-sm font-medium text-slate-900">
                      ${student.amountDue.toLocaleString()} due
                    </span>
                  )}
                  {student.paymentStatus === 'Paid' && student.amountPaid && (
                    <span className="text-sm font-medium text-green-600">
                      ${student.amountPaid.toLocaleString()} paid
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
          {student.paymentStatus === 'Pending' && onMarkAsPaid && (
            <Button
              onClick={() => {
                onMarkAsPaid(student._id)
                onClose()
              }}
              className="w-full rounded-lg bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-[1.02]"
            >
              Mark as Paid
            </Button>
          )}
          {onWhatsAppReminder && (
            <Button
              variant="outline"
              onClick={() => {
                onWhatsAppReminder(student)
              }}
              className="w-full rounded-lg border-slate-200 hover:bg-slate-50 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send WhatsApp Reminder
            </Button>
          )}
        </div>
      </motion.div>
    </Modal>
  )
}
