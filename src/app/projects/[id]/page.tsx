import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  UserPlus,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectOverviewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      supervisor:supervisor_id(id, full_name, university_email),
      members:project_members(
        id,
        member_role,
        profile:user_id(id, full_name, university_email, role)
      )
    `)
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  // Fetch stats: tasks, literature count, unresolved comments
  const { count: taskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id);

  const { count: completedTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id)
    .eq("status", "complete");

  const { count: literatureCount } = await supabase
    .from("literature_items")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Overall Progress
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {project.progress_percent}%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Tasks
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {completedTasks || 0} / {taskCount || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Literature Items
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {literatureCount || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Team Members
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {project.members?.length || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main research description */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-slate-900 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Research Abstract & Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {project.abstract}
              </p>

              {project.objectives && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Methodologies & Objectives
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {project.objectives}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Workspace Modules Access */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href={`/projects/${id}/literature`}>
              <Card className="hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-xs transition-all cursor-pointer bg-white dark:bg-slate-900">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Literature Repository
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Upload papers, detect duplicates, and track reading status.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/projects/${id}/tasks`}>
              <Card className="hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-xs transition-all cursor-pointer bg-white dark:bg-slate-900">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Tasks & Milestones
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Kanban status, deadlines, and student assignees.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/projects/${id}/documents`}>
              <Card className="hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-xs transition-all cursor-pointer bg-white dark:bg-slate-900">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Drafts & Revisions
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Version histories, diff comparison, and inline comments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/projects/${id}/chat`}>
              <Card className="hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-xs transition-all cursor-pointer bg-white dark:bg-slate-900">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Scoped Collaboration Chat
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Private discussion thread between supervisor and group members.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Sidebar: Research Team Members */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Research Members
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {project.members?.map((member: any) => (
                  <div
                    key={member.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {member.profile?.full_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {member.profile?.university_email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        member.member_role === "supervisor"
                          ? "default"
                          : member.member_role === "owner"
                          ? "success"
                          : "secondary"
                      }
                      className="text-[10px] capitalize"
                    >
                      {member.member_role.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
