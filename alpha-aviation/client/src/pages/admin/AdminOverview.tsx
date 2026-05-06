import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import { Users, DollarSign, CheckCircle2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AdminOverview() {
  const {
    enrolledStudents, displayTotalRevenue, displayPendingRevenue,
    safeStudents, loading, error, authError, lastUpdated,
    fetchStudents, fetchFinancialStats,
  } = useAdminData();

  const recentStudents = safeStudents.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Command Center</h1>
          <p className="text-slate-500">Overview of your aviation school operations</p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">Last updated: {lastUpdated.toLocaleString()}</p>
          )}
        </div>
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

      {safeStudents.length === 0 && !loading && (
        <div className="p-4 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-700">
          <p className="font-medium">No students registered yet. Waiting for first enrollment...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Enrolled Students</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{enrolledStudents}</p>
                </div>
                <div className="p-3 bg-[#0061FF]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[#0061FF]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Revenue Pending</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{formatNaira(displayPendingRevenue)}</p>
                </div>
                <div className="p-3 bg-[#007bff] rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{formatNaira(displayTotalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {recentStudents.length > 0 && (
        <Card className="border-slate-200/50">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-900">Email</TableHead>
                  <TableHead className="text-slate-900">Student Name</TableHead>
                  <TableHead className="text-slate-900">Payment Status</TableHead>
                  <TableHead className="text-slate-900">Student Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell><div className="h-3.5 bg-slate-100 rounded w-40" /></TableCell>
                        <TableCell><div className="h-3.5 bg-slate-100 rounded w-28" /></TableCell>
                        <TableCell><div className="h-5 bg-slate-100 rounded-full w-16" /></TableCell>
                        <TableCell><div className="h-5 bg-slate-100 rounded-full w-20" /></TableCell>
                      </TableRow>
                    ))
                  : recentStudents.map((student) => (
                      <TableRow key={student._id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{student.email}</TableCell>
                        <TableCell>{student.firstName || ""} {student.lastName || ""}</TableCell>
                        <TableCell>
                          <Badge variant={student.paymentStatus === "Paid" ? "success" : "warning"}>
                            {student.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : student.status === "graduated" ? "success" : "destructive"}>
                            {student.status || "active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
