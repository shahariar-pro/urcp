"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderGit2,
  Users,
  GraduationCap,
  Activity,
  Lock,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  totalProjects: number;
  activeProjects: number;
  totalStudents: number;
  totalFaculty: number;
  statusChartData: { name: string; value: number }[];
  workloadData: { name: string; count: number }[];
}

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AnalyticsClient({
  totalProjects,
  activeProjects,
  totalStudents,
  totalFaculty,
  statusChartData,
  workloadData,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Note */}
      <div className="p-3 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
        <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
        <span>
          <strong>Strict Privacy Policy (SRS §5 & §7.6):</strong> Department analytics provide aggregate metrics only. Private drafts, comments, and project chat discussions are protected by Row Level Security and are never accessible via the admin dashboard.
        </span>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Projects
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalProjects}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                {activeProjects} Active in CS
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FolderGit2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Researchers
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalStudents}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Enrolled Students
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Faculty Supervisors
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalFaculty}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                CS Faculty Mentors
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalProjects > 0
                  ? Math.round(
                      ((statusChartData.find((s) => s.name === "COMPLETED")
                        ?.value || 0) /
                        totalProjects) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Thesis Throughput
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Bar Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#64748b" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supervisor Workload Table / Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Supervisor Distribution & Workload
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {workloadData.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-12">
                No active supervisor workloads recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {workloadData.map((w, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {w.name}
                    </span>
                    <Badge variant="secondary" className="font-bold text-[11px]">
                      {w.count} Projects Supervised
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
