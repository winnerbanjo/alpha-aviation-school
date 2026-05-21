import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student, StudentStatus } from "@/hooks/useAdminData";
import {
  ChevronDown,
  MessageCircleMore,
  SquarePen,
  Trash2,
  UserRoundSearch,
} from "lucide-react";

const getInitials = (firstName?: string, lastName?: string, email?: string) => {
  if (firstName || lastName) {
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
  }
  return email ? email.substring(0, 2).toUpperCase() : "ST";
};

const getGradient = (str: string) => {
  const hash = str
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const gradients = [
    "from-indigo-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
    "from-sky-500 to-cyan-500",
  ];
  return gradients[Math.abs(hash) % gradients.length];
};

const getStatusSelectStyles = (status?: string) => {
  switch (status) {
    case "graduated":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70";
    case "suspended":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70";
    case "banned":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70";
    default:
      return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70";
  }
};

interface AdminStudentTableProps {
  students: Student[];
  loading?: boolean;
  selectable?: boolean;
  selectedStudents?: Set<string>;
  allSelected?: boolean;
  emptyMessage?: string;
  statusUpdating?: string | null;
  onToggleSelectAll?: () => void;
  onToggleStudentSelection?: (studentId: string) => void;
  onStatusChange: (studentId: string, status: StudentStatus) => void;
  onView: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onWhatsApp: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function AdminStudentTable({
  students,
  loading,
  selectable = false,
  selectedStudents = new Set(),
  allSelected = false,
  emptyMessage = "No students found.",
  statusUpdating,
  onToggleSelectAll,
  onToggleStudentSelection,
  onStatusChange,
  onView,
  onEdit,
  onWhatsApp,
  onDelete,
}: AdminStudentTableProps) {
  const colSpan = selectable ? 6 : 5;

  return (
    <div className="p-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-100/80 bg-slate-50/50 hover:bg-slate-50/50">
            {selectable && (
              <TableHead className="w-12 py-4 px-6">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </TableHead>
            )}
            <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">
              Student
            </TableHead>
            <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">
              Phone
            </TableHead>
            <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">
              Payment Status
            </TableHead>
            <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">
              Student Status
            </TableHead>
            <TableHead className="text-right text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                {selectable && (
                  <TableCell className="py-4 px-6">
                    <div className="h-4 w-4 bg-slate-100 rounded" />
                  </TableCell>
                )}
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-slate-100 rounded w-28" />
                      <div className="h-3 bg-slate-100 rounded w-40" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="h-3.5 bg-slate-100 rounded w-24" />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="h-6 bg-slate-100 rounded-full w-20" />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="h-7 bg-slate-100 rounded-full w-28" />
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  <div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-16">
                <EmptyState type="students" message={emptyMessage} />
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => {
              const initials = getInitials(
                student.firstName,
                student.lastName,
                student.email,
              );

              return (
                <TableRow
                  key={student._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {selectable && (
                    <TableCell
                      className="py-4 px-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student._id)}
                        onChange={() => onToggleStudentSelection?.(student._id)}
                        className="rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </TableCell>
                  )}
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(initials)} flex items-center justify-center text-white text-sm font-semibold shadow-sm flex-shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 text-sm leading-tight truncate">
                          {student.firstName || student.lastName
                            ? `${student.firstName || ""} ${student.lastName || ""}`
                            : "Unregistered Student"}
                        </span>
                        <span className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {student.phone ? (
                      <span className="text-sm font-medium text-slate-700">
                        {student.phone}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50">
                        Missing
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        student.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                          : student.paymentStatus === "Under Review"
                            ? "bg-blue-50 text-blue-700 border-blue-100/50"
                            : "bg-amber-50 text-amber-700 border-amber-100/50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          student.paymentStatus === "Paid"
                            ? "bg-emerald-500"
                            : student.paymentStatus === "Under Review"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                        }`}
                      />
                      {student.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell
                    className="py-4 px-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative inline-block w-28">
                      <select
                        value={student.status || "active"}
                        disabled={statusUpdating !== null}
                        onChange={(e) =>
                          onStatusChange(
                            student._id,
                            e.target.value as StudentStatus,
                          )
                        }
                        className={`w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getStatusSelectStyles(student.status)}`}
                      >
                        <option value="active">Active</option>
                        <option value="graduated">Graduated</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-right py-4 px-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => onView(student)} className="rounded-full hover:bg-indigo-50 p-2" title="View profile">
                        <UserRoundSearch className="w-4 h-4 text-indigo-600" />
                      </Button>
                      {onEdit && (
                        <Button size="sm" variant="ghost" onClick={() => onEdit(student)} className="rounded-full hover:bg-sky-50 p-2" title="Edit student">
                          <SquarePen className="w-4 h-4 text-sky-600" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => onWhatsApp(student)} className="rounded-full hover:bg-green-50 p-2" title="Send reminder">
                        <MessageCircleMore className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(student)} className="rounded-full hover:bg-red-50 p-2" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
