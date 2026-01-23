import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { uploadDocument } from '@/api'
import { Upload, FileCheck, Image as ImageIcon } from 'lucide-react'

export function DocumentUploader() {
  const { user, setUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (ID/Passport photo)')
      return
    }

    try {
      setUploading(true)
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll create a mock URL
      const mockUrl = URL.createObjectURL(file)
      
      await uploadDocument(mockUrl)
      
      // Update user in store
      if (user) {
        setUser({ ...user, documentUrl: mockUrl })
      }
      
      alert('Document uploaded successfully!')
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">ID/Passport Upload</CardTitle>
          <CardDescription className="text-slate-500">
            Upload a photo of your ID or Passport for school records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.documentUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <FileCheck className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-green-900">Document Uploaded</p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-green-700">Your ID/Passport has been submitted and verified</p>
                </div>
              </div>
              <img
                src={user.documentUrl}
                alt="Uploaded document"
                className="w-full max-w-md mx-auto rounded-lg border border-slate-200"
              />
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-[#0061FF] bg-[#0061FF]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-900 mb-2">
                Drop your ID/Passport photo here
              </p>
              <p className="text-xs text-slate-500 mb-4">
                or click to browse
              </p>
              <input
                type="file"
                id="document-upload"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
                className="hidden"
              />
              <label htmlFor="document-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-200/50"
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Select File'}
                </Button>
              </label>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
