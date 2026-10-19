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
import { Building2 } from "lucide-react";
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
    "from-[#1246C8] to-[#5B86FF]",
    "from-[#10264B] to-[#1246C8]",
    "from-[#0F3BAA] to-[#8EAEFF]",
    "from-[#07152E] to-[#2D3E59]",
    "from-[#1246C8] to-[#10264B]",
    "from-[#2D3E59] to-[#5B86FF]",
  ];
  return gradients[Math.abs(hash) % gradients.length];
};

const getStatusSelectStyles = (status?: string) => {
  switch (status) {
    case "graduated":
      return "bg-emerald-50 text-emerald-700 border-emerald-600/15 hover:bg-emerald-100/70";
    case "suspended":
      return "bg-amber-50 text-amber-700 border-amber-600/15 hover:bg-amber-100/70";
    case "banned":
      return "bg-red-50 text-red-700 border-red-600/15 hover:bg-red-100/70";
    default:
      return "bg-[#DCE8FF]/70 text-[#1246C8] border-[#1246C8]/15 hover:bg-[#DCE8FF]";
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#DCE2EB] bg-[#F5F7FB]/70 hover:bg-[#F5F7FB]/70">
            {selectable && (
              <TableHead className="h-12 w-12 px-6">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border-[#C3CCDA] accent-[#1246C8] focus:ring-[#1246C8]/30"
                />
              </TableHead>
            )}
            <TableHead className="h-12 whitespace-nowrap px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">
              Student
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">
              Phone
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">
              Payment Status
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">
              Student Status
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap px-6 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">
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
                    <div className="h-4 w-4 rounded bg-[#EEF2F8]" />
                  </TableCell>
                )}
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#EEF2F8]" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-28 rounded-full bg-[#EEF2F8]" />
                      <div className="h-3 w-40 rounded-full bg-[#EEF2F8]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="h-3.5 w-24 rounded-full bg-[#EEF2F8]" />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="h-6 w-20 rounded-full bg-[#EEF2F8]" />
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="h-7 w-28 rounded-full bg-[#EEF2F8]" />
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  <div className="ml-auto h-8 w-24 rounded-full bg-[#EEF2F8]" />
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
                  className="group border-b border-[#DCE2EB]/70 transition-colors hover:bg-[#F5F7FB]"
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
                        className="h-4 w-4 cursor-pointer rounded border-[#C3CCDA] accent-[#1246C8] focus:ring-[#1246C8]/30"
                      />
                    </TableCell>
                  )}
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getGradient(initials)} text-[13px] font-semibold text-white shadow-subtle ring-2 ring-white`}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-semibold leading-tight tracking-tight text-[#10264B]">
                          {student.firstName || student.lastName
                            ? `${student.firstName || ""} ${student.lastName || ""}`
                            : "Unregistered Student"}
                        </span>
                        <span className="mt-0.5 truncate text-xs text-[#53647C]">
                          {student.email}
                        </span>
                        {student.enrolledByAgent && (
                          <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-[#DCE8FF] px-2 py-0.5 text-[10px] font-semibold text-[#1246C8] ring-1 ring-[#1246C8]/15">
                            <Building2 className="w-3 h-3" />
                            {student.enrolledByAgent.agencyName || `${student.enrolledByAgent.firstName || ""} ${student.enrolledByAgent.lastName || ""}`.trim() || "Agent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {student.phone ? (
                      <span className="whitespace-nowrap text-sm font-medium tabular-nums text-[#172B49]">
                        {student.phone}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/15">
                        Missing
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        student.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15"
                          : student.paymentStatus === "Under Review"
                            ? "bg-[#DCE8FF] text-[#1246C8] ring-1 ring-[#1246C8]/15"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          student.paymentStatus === "Paid"
                            ? "bg-emerald-500"
                            : student.paymentStatus === "Under Review"
                              ? "bg-[#1246C8]"
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
                        className={`w-full cursor-pointer appearance-none rounded-full border py-1.5 pl-3 pr-8 text-xs font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-[#1246C8]/10 disabled:cursor-not-allowed disabled:opacity-50 ${getStatusSelectStyles(student.status)}`}
                      >
                        <option value="active">Active</option>
                        <option value="graduated">Graduated</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-right py-4 px-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => onView(student)} className="h-9 w-9 rounded-full p-0 text-[#1246C8] hover:bg-[#DCE8FF] hover:text-[#1246C8]" title="View profile">
                        <UserRoundSearch className="w-4 h-4" />
                      </Button>
                      {onEdit && (
                        <Button size="sm" variant="ghost" onClick={() => onEdit(student)} className="h-9 w-9 rounded-full p-0 text-[#10264B] hover:bg-[#F5F7FB] hover:text-[#1246C8]" title="Edit student">
                          <SquarePen className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => onWhatsApp(student)} className="h-9 w-9 rounded-full p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" title="Send reminder">
                        <MessageCircleMore className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(student)} className="h-9 w-9 rounded-full p-0 text-red-600 hover:bg-red-50 hover:text-red-700" title="Delete">
                        <Trash2 className="w-4 h-4" />
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
