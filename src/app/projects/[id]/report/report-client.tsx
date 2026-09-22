"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  project: any;
  milestones: any[];
  tasks: any[];
  literature: any[];
  openCommentsCount: number;
}

export function ReportClient({
  project,
  milestones,
  tasks,
  literature,
  openCommentsCount,
}: Props) {
  const completedTasks = tasks.filter((t) => t.status === "complete");
  const reviewedLiterature = literature.filter((l) => l.status === "reviewed");

  return (
    <div className="space-y-6">
      {/* Print / Navigation Bar (Hidden during print) */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs print:hidden">
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF Report
        </Button>
      </div>

      {/* Printable Report Document */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        <div className="space-y-8">
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 print:border-slate-900 pb-6 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-slate-900">
                  AMERICAN INTERNATIONAL UNIVERSITY-BANGLADESH
                </h1>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-600 font-semibold uppercase tracking-wider">
                Department of Computer Science • Faculty of Science & Technology
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-500">
                CSC 3114: Research Methodology & Capstone Project Evaluation
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400 print:text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-800 dark:text-slate-200 print:text-slate-800">
                Official Progress Report
              </p>
              <p>Generated: {formatDate(new Date().toISOString())}</p>
              <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                Status: {project.status.replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* Project Title & Metadata */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white print:text-slate-900 leading-tight">
              {project.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 print:bg-slate-50 rounded-lg border border-slate-100 dark:border-slate-800 print:border-slate-100">
                <span className="font-bold text-slate-500 dark:text-slate-400 print:text-slate-500 uppercase text-[10px]">
                  Assigned Faculty Supervisor
                </span>
                <p className="font-semibold text-slate-900 dark:text-white print:text-slate-900 text-sm mt-0.5">
                  {project.supervisor?.full_name}
                </p>
                <p className="text-slate-500 dark:text-slate-400 print:text-slate-500">
                  {project.supervisor?.university_email}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 print:bg-slate-50 rounded-lg border border-slate-100 dark:border-slate-800 print:border-slate-100">
                <span className="font-bold text-slate-500 dark:text-slate-400 print:text-slate-500 uppercase text-[10px]">
                  Enrolled Research Members
                </span>
                <div className="mt-1 space-y-0.5">
                  {project.members?.map((m: any, idx: number) => (
                    <p key={idx} className="font-semibold text-slate-800 dark:text-slate-200 print:text-slate-800">
                      {m.profile?.full_name}{" "}
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 print:text-slate-500 capitalize">
                        ({m.member_role.replace("_", " ")})
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Abstract */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white print:text-slate-900 uppercase tracking-wider">
              Research Abstract
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-800/40 print:bg-slate-50/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 print:border-slate-100">
              {project.abstract}
            </p>
          </div>

          {/* Progress Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Overall Progress
              </span>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 print:text-blue-600 mt-1">
                {project.progress_percent}%
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Tasks Completed
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 print:text-emerald-600 mt-1">
                {completedTasks.length} / {tasks.length}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Literature Reviewed
              </span>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 print:text-purple-600 mt-1">
                {reviewedLiterature.length} / {literature.length}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 print:border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Unresolved Comments
              </span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 print:text-amber-600 mt-1">
                {openCommentsCount}
              </p>
            </div>
          </div>

          {/* Milestones Schedule Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white print:text-slate-900 uppercase tracking-wider">
              Milestone Deadlines & Status
            </h3>
            {milestones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No milestones defined.</p>
            ) : (
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 print:border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-800/60 print:bg-slate-50 text-slate-600 dark:text-slate-300 print:text-slate-600 font-semibold border-b border-slate-200 dark:border-slate-800 print:border-slate-200">
                  <tr>
                    <th className="p-2.5">Milestone</th>
                    <th className="p-2.5">Target Due Date</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-100">
                  {milestones.map((m: any) => (
                    <tr key={m.id}>
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 print:text-slate-800">
                        {m.title}
                      </td>
                      <td className="p-2.5 text-slate-500 dark:text-slate-400 print:text-slate-500">
                        {formatDate(m.due_date)}
                      </td>
                      <td className="p-2.5 text-right capitalize text-slate-700 dark:text-slate-300 print:text-slate-700">
                        {m.status.replace("_", " ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Signoff block */}
          <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
            <div className="border-t border-slate-400 dark:border-slate-600 print:border-slate-400 pt-2">
              <p className="font-semibold text-slate-900 dark:text-white print:text-slate-900">
                {project.supervisor?.full_name || "Faculty Supervisor Signature"}
              </p>
              <p className="text-slate-500 dark:text-slate-400 print:text-slate-500">Department of Computer Science</p>
            </div>
            <div className="border-t border-slate-400 dark:border-slate-600 print:border-slate-400 pt-2">
              <p className="font-semibold text-slate-900 dark:text-white print:text-slate-900">Lead Student Researcher</p>
              <p className="text-slate-500 dark:text-slate-400 print:text-slate-500">CSC 3114 Research Team</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
