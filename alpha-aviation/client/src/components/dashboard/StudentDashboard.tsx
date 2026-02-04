import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { CreditCard, AlertCircle, CheckCircle2, Calendar, BookOpen, User, FileText, Download, DollarSign, Upload, CheckCircle } from 'lucide-react'
import { CurriculumTimeline } from '@/components/student/CurriculumTimeline'
import { ProfileDashboard } from '@/components/student/ProfileDashboard'
import { DocumentUploader } from '@/components/student/DocumentUploader'
import { ResourceLibrary } from '@/components/student/ResourceLibrary'
import { PaymentModal } from '@/components/PaymentModal'
import { uploadPaymentReceipt } from '@/api'

type TabType = 'overview' | 'curriculum' | 'profile' | 'resources' | 'documents'

export function StudentDashboard() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)

  // Initialize tab from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('activeTab')
    if (saved && ['overview', 'curriculum', 'profile', 'resources', 'documents'].includes(saved)) {
      setActiveTab(saved as TabType)
    }
  }, [])

  // Listen for tab changes from sidebar
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail && ['overview', 'curriculum', 'profile', 'resources', 'documents'].includes(customEvent.detail)) {
        setActiveTab(customEvent.detail as TabType)
      }
    }
    window.addEventListener('tabChange', handleTabChange)
    return () => window.removeEventListener('tabChange', handleTabChange)
  }, [])

  // Update sessionStorage when tab changes
  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab)
    sessionStorage.setItem('activeTab', tab)
  }

  const isPending = user?.paymentStatus === 'Pending'
  const amountDue = user?.amountDue || 0
  const enrollmentDate = user?.enrollmentDate 
    ? new Date(user.enrollmentDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null
  
  // Check if student needs to upload payment receipt (status is Pending Payment and no receipt uploaded)
  const needsPaymentReceipt = user?.status === 'Pending Payment' && !user?.paymentReceiptUrl

  const handleReceiptUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      alert('Please upload an image file (JPG, PNG) or PDF')
      return
    }

    try {
      setUploadingReceipt(true)
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll create a mock URL
      const mockUrl = URL.createObjectURL(file)
      
      const response = await uploadPaymentReceipt(mockUrl)
      
      // Update user in store
      if (user && response?.data) {
        setUser({ 
          ...user, 
          paymentReceiptUrl: response.data.paymentReceiptUrl,
          status: response.data.status || 'Payment Received'
        })
      }
      
      setReceiptUploaded(true)
      setTimeout(() => setReceiptUploaded(false), 5000)
    } catch (error: any) {
      console.error('Error uploading receipt:', error)
      alert(error.response?.data?.message || 'Failed to upload receipt. Please try again.')
    } finally {
      setUploadingReceipt(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'curriculum', label: 'Flight Roadmap', icon: BookOpen },
    { id: 'documents', label: 'Document Vault', icon: FileText },
    { id: 'resources', label: 'Resource Library', icon: Download },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          My Training
        </h1>
        <p className="text-slate-500">Track your progress and manage your account</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/50">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
                    onClick={() => handleTabClick(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#0061FF] text-[#0061FF]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Action Required: Payment Receipt Upload */}
          {needsPaymentReceipt && (
            <Card className="border-2 border-[#0061FF] bg-gradient-to-br from-[#0061FF]/5 to-blue-50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#0061FF] rounded-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-slate-900 mb-1">Action Required</CardTitle>
                    <CardDescription className="text-slate-600">
                      Welcome to Alpha Step Links! To finalize your enrollment, please upload your Bank Transfer Receipt.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {receiptUploaded ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg text-center"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Receipt Uploaded Successfully!
                    </p>
                    <p className="text-xs text-green-700">
                      Our team will verify your payment shortly. You'll receive a confirmation email once processed.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleReceiptUpload(file)
                            }
                          }}
                          className="hidden"
                          disabled={uploadingReceipt}
                        />
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#0061FF] transition-colors">
                          <Upload className="w-10 h-10 text-slate-400 mb-3" />
                          <p className="text-sm font-medium text-slate-900 mb-1">
                            {uploadingReceipt ? 'Uploading...' : 'Click to upload Bank Transfer Receipt'}
                          </p>
                          <p className="text-xs text-slate-500">
                            JPG, PNG, or PDF (Max 5MB)
                          </p>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      After completing your bank transfer, upload the receipt here for verification.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enrollment Info Card */}
          {user?.enrolledCourse && (
            <Card className="border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-slate-900">Enrollment Details</CardTitle>
                <CardDescription className="text-slate-500">
                  Your current training program information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Enrolled Course</p>
                  <p className="text-lg font-medium text-slate-900">{user.enrolledCourse}</p>
                </div>
                {enrollmentDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      Enrolled on {enrollmentDate}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Billing Status Card */}
          <Card className={`border-slate-200/50 ${isPending ? 'bg-slate-50' : 'bg-white'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Billing Status</CardTitle>
                  <CardDescription className="text-slate-500">
                    Your payment information
                  </CardDescription>
                </div>
                {isPending ? (
                  <Badge variant="warning" className="text-sm">
                    Pending
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-sm">
                    Paid
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPending ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-4 border-b border-slate-200">
                      <span className="text-lg font-medium text-slate-900">
                        Amount Due
                      </span>
                      <span className="text-3xl font-bold tracking-tighter text-slate-900">
                        ${amountDue.toLocaleString()}.00
                      </span>
                    </div>
                    <div className="p-4 bg-[#007bff] border border-[#007bff] rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-white mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">
                            Payment Required
                          </p>
                          <p className="text-sm text-white">
                            Please complete your payment to continue your training program.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white py-6 text-base shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      View Payment Instructions
                    </Button>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                        <div className="p-1.5 bg-[#0061FF]/10 rounded">
                          <DollarSign className="w-4 h-4 text-[#0061FF]" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          Payment Method: Bank Transfer
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-2">
                        Bank Transfer Instructions:
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                        <li>Account Name: Alpha Step Links Aviation School</li>
                        <li>Account Number: 1234567890</li>
                        <li>Bank: [Your Bank Name]</li>
                        <li>Reference: {user?.email}</li>
                      </ul>
                      <p className="text-xs text-slate-500 mt-3">
                        After transfer, contact admin@alpha.com with proof of payment.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tighter text-slate-900 mb-2">
                    Payment Complete
                  </h3>
                  <p className="text-slate-500">
                    Your payment has been processed. You can now access all training materials.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Upload */}
          <DocumentUploader />
        </div>
      )}

      {activeTab === 'curriculum' && user?.enrolledCourse && (
        <Card className="border-slate-200/50">
          <CardContent className="p-6">
            <CurriculumTimeline course={user.enrolledCourse} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'documents' && (
        <DocumentUploader />
      )}

      {activeTab === 'profile' && (
        <ProfileDashboard />
      )}

      {activeTab === 'resources' && (
        <Card className="border-slate-200/50">
          <CardContent className="p-6">
            <ResourceLibrary />
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amountDue={amountDue}
        userEmail={user?.email}
      />
    </motion.div>
  )
}
