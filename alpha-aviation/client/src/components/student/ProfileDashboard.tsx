import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { updateStudentProfile } from '@/api'
import { User, Phone, FileText, Save, AlertCircle, Download, IdCard, Award, Lock } from 'lucide-react'

export function ProfileDashboard() {
  const { user, setUser } = useAuthStore()
  const [phone, setPhone] = useState(user?.phone || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '')
      setBio(user.bio || '')
      setEmergencyContact(user.emergencyContact || '')
    }
  }, [user])

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await updateStudentProfile(phone, bio, emergencyContact)
      setUser(response.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0061FF]/10 rounded-lg">
              <User className="w-5 h-5 text-[#0061FF]" />
            </div>
            <div>
              <CardTitle className="text-slate-900 tracking-tighter">Profile Settings</CardTitle>
              <CardDescription className="text-slate-500">
                Update your personal information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Emergency Contact
            </label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
            />
            <p className="text-xs text-slate-400 mt-1">Contact person in case of emergency</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{bio.length}/500 characters</p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white shadow-sm transition-all duration-300 hover:scale-105"
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card className="border-slate-200/50 mt-6">
        <CardHeader>
          <CardTitle className="text-slate-900 tracking-tighter">Downloads</CardTitle>
          <CardDescription className="text-slate-500">
            Download your student documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Student ID Card */}
          <Button
            onClick={() => {
              // Generate and download student ID card
              alert('Student ID Card download initiated. Your ID card will be generated and downloaded.')
            }}
            className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white shadow-sm transition-all duration-300 hover:scale-105"
          >
            <IdCard className="w-4 h-4 mr-2" />
            Download Student ID Card
          </Button>

          {/* Download Certificate */}
          <Button
            onClick={() => {
              if (!user?.adminClearance) {
                alert('Certificate download is locked. Please wait for admin clearance before downloading your certificate.')
              } else {
                alert('Certificate download initiated. Your certificate will be generated and downloaded.')
              }
            }}
            disabled={!user?.adminClearance}
            className={`w-full rounded-full shadow-sm transition-all duration-300 hover:scale-105 ${
              user?.adminClearance
                ? 'bg-[#0061FF] hover:bg-[#0052E6] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {user?.adminClearance ? (
              <>
                <Award className="w-4 h-4 mr-2" />
                Download Certificate
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Download Certificate (Locked - Awaiting Admin Clearance)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
