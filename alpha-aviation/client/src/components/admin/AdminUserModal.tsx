import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { Student } from "@/hooks/useAdminData";

const courses = [
  "Aviation Fundamentals & Strategy",
  "Elite Cabin Crew & Safety Operations",
  "Travel & Tourism Management",
  "Airline Customer Service & Passenger Handling",
  "Aviation Safety & Security Awareness",
  "Ticketing & Reservation Systems (GDS Training)",
];

interface AdminUserModalProps {
  isOpen: boolean;
  editingUser: Student | null;
  userFormData: any;
  setUserFormData: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSave: () => void;
}

export function AdminUserModal({
  isOpen,
  editingUser,
  userFormData,
  setUserFormData,
  onClose,
  onSave,
}: AdminUserModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? "Edit Student Details" : "Add New User"}
      wide={Boolean(editingUser)}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">First Name</label>
            <input type="text" value={userFormData.firstName} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, firstName: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Last Name</label>
            <input type="text" value={userFormData.lastName} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, lastName: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input type="email" value={userFormData.email} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, email: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
            <input type="text" value={userFormData.phone} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, phone: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+234..." />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">
            {editingUser ? "New Password" : "Password"}
          </label>
          <input
            type="text"
            value={userFormData.password}
            onChange={(e) => setUserFormData((prev: any) => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={editingUser ? "Leave blank to keep current password" : "Temporary password"}
          />
          {editingUser && (
            <p className="text-xs text-slate-500 mt-1">
              Only fill this field if you want to reset the user's password.
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Role</label>
          <select value={userFormData.role} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, role: e.target.value as "admin" | "student" }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {editingUser && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Account Status</label>
                <select value={userFormData.status} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, status: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Payment Status</label>
                <select value={userFormData.paymentStatus} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, paymentStatus: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Student ID Number</label>
                <input type="text" value={userFormData.studentIdNumber} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, studentIdNumber: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ASL-2026-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Enrolled Course</label>
                <select value={userFormData.enrolledCourse} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, enrolledCourse: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Not assigned</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Amount Due</label>
                <input type="number" min="0" value={userFormData.amountDue} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, amountDue: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Amount Paid</label>
                <input type="number" min="0" value={userFormData.amountPaid} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, amountPaid: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Total Price</label>
                <input type="number" min="0" value={userFormData.totalCoursePrice} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, totalCoursePrice: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={userFormData.adminClearance} onChange={(e) => setUserFormData((prev: any) => ({ ...prev, adminClearance: e.target.checked }))} className="rounded border-slate-300" />
              Admin clearance completed
            </label>
          </>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={onSave}>
            {editingUser ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
