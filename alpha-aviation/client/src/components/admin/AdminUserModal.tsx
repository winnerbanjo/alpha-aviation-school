import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { Student, StudentStatus, UserFormData } from "@/hooks/useAdminData";
import { COURSE_CATALOG } from "@/data/courseCatalog";

const courses: string[] = COURSE_CATALOG.map((course) => course.title);

interface AdminUserModalProps {
  isOpen: boolean;
  editingUser: Student | null;
  userFormData: UserFormData;
  setUserFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
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
      <div className="-m-1 max-h-[72vh] space-y-5 overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">First Name</label>
            <input type="text" value={userFormData.firstName} onChange={(e) => setUserFormData((prev) => ({ ...prev, firstName: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" placeholder="John" />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Last Name</label>
            <input type="text" value={userFormData.lastName} onChange={(e) => setUserFormData((prev) => ({ ...prev, lastName: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" placeholder="Doe" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Email</label>
            <input type="email" value={userFormData.email} onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" placeholder="john@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Phone</label>
            <input type="text" value={userFormData.phone} onChange={(e) => setUserFormData((prev) => ({ ...prev, phone: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" placeholder="+234..." />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
            {editingUser ? "New Password" : "Password"}
          </label>
          <input
            type="text"
            value={userFormData.password}
            onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
            placeholder={editingUser ? "Leave blank to keep current password" : "Temporary password"}
          />
          {editingUser && (
            <p className="mt-2 text-xs text-[#53647C]">
              Only fill this field if you want to reset the user's password.
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Role</label>
          <select value={userFormData.role} onChange={(e) => setUserFormData((prev) => ({ ...prev, role: e.target.value as "admin" | "student" }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {editingUser && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Account Status</label>
                <select value={userFormData.status} onChange={(e) => setUserFormData((prev) => ({ ...prev, status: e.target.value as StudentStatus }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10">
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Payment Status</label>
                <select value={userFormData.paymentStatus} onChange={(e) => setUserFormData((prev) => ({ ...prev, paymentStatus: e.target.value as UserFormData["paymentStatus"] }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10">
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Student ID Number</label>
                <input type="text" value={userFormData.studentIdNumber} onChange={(e) => setUserFormData((prev) => ({ ...prev, studentIdNumber: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" placeholder="ASL-2026-0000" />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Enrolled Course</label>
                <select value={userFormData.enrolledCourse} onChange={(e) => setUserFormData((prev) => ({ ...prev, enrolledCourse: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10">
                  <option value="">Not assigned</option>
                  {/* Keep a legacy course title selectable so editing an older record doesn't silently clear it */}
                  {userFormData.enrolledCourse && !courses.includes(userFormData.enrolledCourse) && (
                    <option value={userFormData.enrolledCourse}>{userFormData.enrolledCourse} (legacy)</option>
                  )}
                  {courses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Amount Due</label>
                <input type="number" min="0" value={userFormData.amountDue} onChange={(e) => setUserFormData((prev) => ({ ...prev, amountDue: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Amount Paid</label>
                <input type="number" min="0" value={userFormData.amountPaid} onChange={(e) => setUserFormData((prev) => ({ ...prev, amountPaid: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Total Price</label>
                <input type="number" min="0" value={userFormData.totalCoursePrice} onChange={(e) => setUserFormData((prev) => ({ ...prev, totalCoursePrice: e.target.value }))} className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] px-4 py-3 text-sm font-medium text-[#172B49] transition-colors hover:border-[#1246C8]/40">
              <input type="checkbox" checked={userFormData.adminClearance} onChange={(e) => setUserFormData((prev) => ({ ...prev, adminClearance: e.target.checked }))} className="h-4 w-4 rounded border-[#C3CCDA] accent-[#1246C8]" />
              Admin clearance completed
            </label>
          </>
        )}
        <div className="flex gap-3 border-t border-[#DCE2EB] pt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={onSave}>
            {editingUser ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
