import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getAllStudents, getFinancialStats, getAdminTest, updatePaymentStatus, batchUpdatePaymentStatus, updateStudentCourse } from '@/api'
import { Users, DollarSign, CheckCircle2, Search, MessageCircle, Send, Filter, RefreshCw, Wifi } from 'lucide-react'
import { StudentProfileModal } from './StudentProfileModal'
import { EmptyState } from '@/components/EmptyState'

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
  adminClearance?: boolean
}

const courses = [
  'Aviation Fundamentals & Strategy',
  'Elite Cabin Crew & Safety Operations',
  'Travel & Tourism Management',
  'Airline Customer Service & Passenger Handling',
  'Aviation Safety & Security Awareness',
  'Ticketing & Reservation Systems (GDS Training)',
]

type AdminTab = 'overview' | 'students' | 'revenue'

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalRevenuePendingCalc, setTotalRevenuePendingCalc] = useState(0)
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Pending' | 'Paid'>('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [testConnectionStatus, setTestConnectionStatus] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize tab from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('adminTab')
    if (saved && ['overview', 'students', 'revenue'].includes(saved)) {
      setActiveTab(saved as AdminTab)
    }
  }, [])

  // Listen for tab changes from sidebar
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail && ['overview', 'students', 'revenue'].includes(customEvent.detail)) {
        setActiveTab(customEvent.detail as AdminTab)
        sessionStorage.setItem('adminTab', customEvent.detail) // Ensure sessionStorage is updated
      }
    }
    window.addEventListener('adminTabChange', handleTabChange)
    return () => window.removeEventListener('adminTabChange', handleTabChange)
  }, [])

  useEffect(() => {
    fetchStudents()
    fetchFinancialStats()
  }, [])

  // Calculate stats from students array (fallback if API doesn't return data)
  const calculatedTotalRevenue = students
    .filter(s => s.paymentStatus === 'Paid')
    .reduce((sum, s) => sum + (s.amountPaid || s.amountDue || 0), 0)
  
  const calculatedPendingRevenue = students
    .filter(s => s.paymentStatus === 'Pending')
    .reduce((sum, s) => sum + (s.amountDue || 0), 0)

  // Use calculated values if API values are 0 but we have students
  const displayTotalRevenue = totalRevenue > 0 || students.length === 0 ? totalRevenue : calculatedTotalRevenue
  const displayPendingRevenue = totalRevenuePendingCalc > 0 || students.length === 0 ? totalRevenuePendingCalc : calculatedPendingRevenue

  // Update API values when students array changes (if API didn't return data)
  useEffect(() => {
    if (students.length > 0 && totalRevenue === 0) {
      setTotalRevenue(calculatedTotalRevenue)
    }
    if (students.length > 0 && totalRevenuePendingCalc === 0) {
      setTotalRevenuePendingCalc(calculatedPendingRevenue)
    }
  }, [students, calculatedTotalRevenue, calculatedPendingRevenue, totalRevenue, totalRevenuePendingCalc])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllStudents()
      console.log('Admin Data:', response)
      const raw = response?.data?.students ?? response?.students
      const list = Array.isArray(raw) ? raw : []
      setStudents(list)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Error fetching students:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to load students from server.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestConnectionStatus(null)
    try {
      const res = await getAdminTest()
      const count = res?.data?.totalStudents ?? res?.totalStudents ?? '—'
      setTestConnectionStatus(`Connected: ${count} students in database`)
    } catch (err: any) {
      setTestConnectionStatus(err?.response?.data?.message || err?.message || 'Connection failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const fetchFinancialStats = async () => {
    try {
      const response = await getFinancialStats()
      setTotalRevenue(response?.data?.totalRevenue ?? 0)
      setTotalRevenuePendingCalc(response?.data?.revenuePending ?? 0)
    } catch (err: any) {
      console.error('Error fetching financial stats:', err)
      if (!error) setError(err?.response?.data?.message || err?.message || 'Failed to load financial stats.')
    }
  }

  const handleMarkAsPaid = async (studentId: string) => {
    try {
      await updatePaymentStatus(studentId)
      // Update local state immediately for instant UI feedback
      setStudents(prev => prev.map(s => 
        s._id === studentId 
          ? { ...s, paymentStatus: s.paymentStatus === 'Pending' ? 'Paid' : 'Pending', amountPaid: s.amountDue, amountDue: 0 }
          : s
      ))
      await fetchStudents()
      await fetchFinancialStats()
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status')
    }
  }

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
    setIsProfileModalOpen(true)
  }

  const handleBatchMarkAsPaid = async () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student')
      return
    }

    try {
      await batchUpdatePaymentStatus(Array.from(selectedStudents))
      setSelectedStudents(new Set())
      await fetchStudents()
      await fetchFinancialStats()
      alert(`Marked ${selectedStudents.size} student(s) as paid`)
    } catch (error) {
      console.error('Error batch updating payment status:', error)
      alert('Failed to update payment status')
    }
  }

  const handleCourseChange = async (studentId: string, newCourse: string) => {
    try {
      await updateStudentCourse(studentId, newCourse)
      await fetchStudents()
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Failed to update course')
    }
  }

  const handleAdminClearanceChange = async (studentId: string, cleared: boolean) => {
    try {
      // Update local state immediately for instant UI feedback
      setStudents(prev => prev.map(s => 
        s._id === studentId 
          ? { ...s, adminClearance: cleared }
          : s
      ))
      // In production, this would call an API endpoint to update admin clearance
      // await updateAdminClearance(studentId, cleared)
      console.log(`Admin clearance ${cleared ? 'granted' : 'revoked'} for student ${studentId}`)
    } catch (error) {
      console.error('Error updating admin clearance:', error)
      alert('Failed to update admin clearance')
      // Revert on error
      await fetchStudents()
    }
  }

  const handleWhatsAppReminder = (student: Student) => {
    const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student'
    const amountDue = student.amountDue || 0
    
    const message = encodeURIComponent(
      `Hello ${studentName}, this is Alpha Step Links Aviation School. A reminder of your balance: $${amountDue.toLocaleString()}. ` +
      `Please complete your payment to continue your training program. Thank you!`
    )
    
    const phone = student.phone || '2341234567890'
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleInvite = () => {
    const message = encodeURIComponent(
      'Welcome to Alpha Step Links Aviation School! 🛫\n\n' +
      'Complete your enrollment here: https://alphasteplinks.com/enroll\n\n' +
      'We offer world-class aviation training programs designed to launch your career. ' +
      'Join us today and take the first step towards your aviation dreams!'
    )
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s._id)))
    }
  }

  // Calculate stats
  const enrolledStudents = students.length

  // Filter students based on search and payment status
  const filteredStudents = students.filter((student) => {
    // Payment status filter
    if (paymentFilter !== 'all' && student.paymentStatus !== paymentFilter) {
      return false
    }

    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
    return (
      student.email.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      student.enrolledCourse?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-slate-600">
        <div className="animate-pulse rounded-full h-10 w-10 border-2 border-[#0061FF] border-t-transparent mb-4" />
        <p className="text-lg font-medium">Loading Student Data...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching from ASL server</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-medium text-red-800">Error loading dashboard</p>
          <p className="text-sm text-red-600 mt-1">Error: {error}</p>
        </div>
        <Button onClick={() => { setError(null); setLoading(true); fetchStudents(); fetchFinancialStats(); }} className="rounded-full bg-[#0061FF] text-white">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8 p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {activeTab === 'overview' && 'Command Center'}
            {activeTab === 'students' && 'Student Management'}
            {activeTab === 'revenue' && 'Revenue Analytics'}
          </h1>
          <p className="text-slate-500">
            {activeTab === 'overview' && 'Manage students and track payments'}
            {activeTab === 'students' && 'View and manage all enrolled students'}
            {activeTab === 'revenue' && 'Track revenue and payment analytics'}
          </p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="rounded-full border-slate-200/50"
          >
            <Wifi className="w-4 h-4 mr-2" />
            {testingConnection ? 'Testing…' : 'Test Connection'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { fetchStudents(); fetchFinancialStats(); }}
            className="rounded-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      {testConnectionStatus && (
        <p className={`text-sm ${testConnectionStatus.startsWith('Connected') ? 'text-green-600' : 'text-red-600'}`}>
          {testConnectionStatus}
        </p>
      )}

      {/* No-data message when server returned empty list */}
      {students.length === 0 && (
        <div className="p-4 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-700">
          <p className="font-medium">No students registered yet. Waiting for first enrollment...</p>
          <p className="text-sm text-slate-500 mt-1">Data is loaded from the server. Use &quot;Refresh&quot; or &quot;Test Connection&quot; to verify.</p>
        </div>
      )}

      {/* Stats Cards - Show only on Overview */}
      {activeTab === 'overview' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Enrolled Students</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {enrolledStudents}
                  </p>
                </div>
                <div className="p-3 bg-[#0061FF]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[#0061FF]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Revenue Pending</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    ${displayPendingRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-[#007bff] rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    ${displayTotalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}

      {/* Action Bar - Show on Overview and Students tabs */}
      {(activeTab === 'overview' || activeTab === 'students') && (
      <div className="flex flex-col gap-4">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex gap-2 border border-slate-200/50 rounded-lg p-1">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  paymentFilter === 'all'
                    ? 'bg-[#0061FF] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPaymentFilter('Pending')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  paymentFilter === 'Pending'
                    ? 'bg-[#007bff] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setPaymentFilter('Paid')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  paymentFilter === 'Paid'
                    ? 'bg-green-100 text-green-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
                  {selectedStudents.size > 0 && (
                    <Button
                      onClick={handleBatchMarkAsPaid}
                      className="rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-105"
                    >
                      Mark {selectedStudents.size} as Paid
                    </Button>
                  )}
                  <Button
                    onClick={handleInvite}
                    variant="outline"
                    className="rounded-full border-slate-200/50 hover:bg-slate-50 transition-all hover:scale-105"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Invite Lead
                  </Button>
        </div>
      </div>
      )}

      {/* Students Table - Show on Overview and Students tabs */}
      {(activeTab === 'overview' || activeTab === 'students') && (
      <Card className="border-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300"
                  />
                </TableHead>
                <TableHead className="text-slate-900">Student Name</TableHead>
                <TableHead className="text-slate-900">Course</TableHead>
                <TableHead className="text-slate-900">Status</TableHead>
                <TableHead className="text-right text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16">
                    <EmptyState
                      type="students"
                      message={
                        searchQuery || paymentFilter !== 'all'
                          ? 'No students found matching your filters. Try adjusting your search or filter settings.'
                          : 'No students registered yet. Waiting for first enrollment...'
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow 
                    key={student._id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleStudentClick(student)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                        className="rounded border-slate-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {student.firstName || ''} {student.lastName || ''}
                      {!student.firstName && !student.lastName && 'N/A'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <select
                        value={student.enrolledCourse || ''}
                        onChange={(e) => {
                          handleCourseChange(student._id, e.target.value)
                          // Update local state immediately
                          setStudents(prev => prev.map(s => 
                            s._id === student._id ? { ...s, enrolledCourse: e.target.value } : s
                          ))
                        }}
                        className="text-sm border border-slate-200/50 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 bg-white min-w-[200px] hover:border-[#0061FF]/50 transition-colors"
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={student.paymentStatus === 'Paid' ? 'success' : 'warning'}
                      >
                        {student.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {student.paymentStatus === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(student._id)}
                              className="rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-105"
                            >
                              Mark as Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWhatsAppReminder(student)}
                              className="rounded-full border-slate-200/50 hover:bg-slate-50 transition-all hover:scale-105"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Remind</span>
                            </Button>
                          </>
                        )}
                        {student.paymentStatus === 'Paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhatsAppReminder(student)}
                            className="rounded-full border-slate-200/50 hover:bg-slate-50 transition-all hover:scale-105"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Revenue Analytics - Show only on Revenue tab */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    ${displayTotalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                From {students.filter(s => s.paymentStatus === 'Paid').length} paid students
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    ${displayPendingRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-[#007bff] rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                From {students.filter(s => s.paymentStatus === 'Pending').length} pending payments
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50 md:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-4">
                Payment Status Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Paid Students</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.paymentStatus === 'Paid').length}
                  </p>
                </div>
                <div className="p-4 bg-[#007bff] rounded-lg">
                  <p className="text-sm text-white mb-1">Pending Payments</p>
                  <p className="text-2xl font-bold text-white">
                    {students.filter(s => s.paymentStatus === 'Pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={selectedStudent}
        onMarkAsPaid={handleMarkAsPaid}
        onWhatsAppReminder={handleWhatsAppReminder}
        onAdminClearanceChange={handleAdminClearanceChange}
      />
    </motion.div>
  )
}
