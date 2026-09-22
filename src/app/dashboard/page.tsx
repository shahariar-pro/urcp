import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  FolderGit2,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Search,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/dashboard");
  }

  const supabase = await createClient();

  // Fetch projects user is a member of
  const { data: memberProjects } = await supabase
    .from("project_members")
    .select(`
      member_role,
      project:project_id(
        id,
        title,
        status,
        progress_percent,
        created_at,
        supervisor:supervisor_id(full_name)
      )
    `)
    .eq("user_id", profile.id);

  // Fetch pending review proposals for supervisors
  const { data: pendingProposals } = await supabase
    .from("proposals")
    .select(`
      id,
      title,
      submitted_at,
      status,
      submitter:submitted_by(full_name, university_email)
    `)
    .eq("supervisor_id", profile.id)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });

  // Fetch student proposals
  const { data: userProposals } = await supabase
    .from("proposals")
    .select(`
      id,
      title,
      status,
      submitted_at,
      project_id
    `)
    .eq("submitted_by", profile.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {profile.department}
              </span>
              <Badge
                variant={
                  profile.role === "admin"
                    ? "destructive"
                    : profile.role === "faculty"
                    ? "default"
                    : "secondary"
                }
                className="capitalize text-[11px]"
              >
                {profile.role}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {profile.full_name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Undergraduate research coordination and workspace system
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile.role === "student" && (
              <Link href="/proposals/new">
                <Button className="gap-1.5 shadow-sm">
                  <Plus className="h-4 w-4" />
                  New Proposal
                </Button>
              </Link>
            )}
            <Link href="/faculty">
              <Button variant="outline" className="gap-1.5">
                <Search className="h-4 w-4" />
                Faculty Directory
              </Button>
            </Link>
          </div>
        </div>

        {/* Pending Proposals Banner for Faculty */}
        {(profile.role === "faculty" || profile.role === "admin") &&
          pendingProposals &&
          pendingProposals.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {pendingProposals.length} Research Proposal(s) Awaiting Review
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                    Student proposals require your formal evaluation to initiate workspace projects.
                  </p>
                </div>
              </div>
              <Link href="/proposals">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs whitespace-nowrap">
                  Review Proposals
                </Button>
              </Link>
            </div>
          )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Workspaces (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Active Research Projects
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {memberProjects?.length || 0} enrolled
              </span>
            </div>

            {(!memberProjects || memberProjects.length === 0) ? (
              <Card className="border-dashed bg-white dark:bg-slate-900/40">
                <CardContent className="p-10 text-center text-slate-500 dark:text-slate-400 space-y-3">
                  <FolderGit2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No active research projects
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {profile.role === "student"
                        ? "Submit a proposal or wait for supervisor approval to create your workspace."
                        : "Approved student proposals will appear here as supervised workspaces."}
                    </p>
                  </div>
                  {profile.role === "student" && (
                    <Link href="/proposals/new">
                      <Button size="sm" className="mt-2">
                        Submit Research Proposal
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {memberProjects.map((item: any) => {
                  const proj = item.project;
                  if (!proj) return null;
                  return (
                    <Card
                      key={proj.id}
                      className="hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xs transition-all bg-white dark:bg-slate-900"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  proj.status === "active"
                                    ? "success"
                                    : "secondary"
                                }
                                className="text-[10px] capitalize"
                              >
                                {proj.status}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                Role: {item.member_role.replace("_", " ")}
                              </Badge>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                              {proj.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Supervisor: {proj.supervisor?.full_name || "Faculty"} • Created {formatDate(proj.created_at)}
                            </p>
                          </div>

                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {proj.progress_percent}% complete
                            </div>
                            <Link href={`/projects/${proj.id}`}>
                              <Button size="sm" className="gap-1 text-xs">
                                Open Workspace
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Proposals Summary & Actions */}
          <div className="space-y-6">
            {profile.role === "student" && (
              <Card className="bg-white dark:bg-slate-900 shadow-2xs">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    My Proposal Status
                  </CardTitle>
                  <Link href="/proposals" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    View all
                  </Link>
                </CardHeader>
                <CardContent className="pt-4">
                  {(!userProposals || userProposals.length === 0) ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      No proposals submitted yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userProposals.slice(0, 4).map((p: any) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {p.title}
                            </span>
                            <Badge
                              variant={
                                p.status === "approved"
                                  ? "success"
                                  : p.status === "submitted"
                                  ? "warning"
                                  : "secondary"
                              }
                              className="text-[9px] shrink-0 capitalize"
                            >
                              {p.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {formatDate(p.submitted_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {profile.role === "admin" && (
              <Card className="bg-white dark:bg-slate-900 shadow-2xs border-purple-200 dark:border-purple-900/60">
                <CardHeader className="pb-3 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/40 rounded-t-lg">
                  <CardTitle className="text-sm font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Admin Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full justify-start text-xs h-9">
                      Department Analytics
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full justify-start text-xs h-9">
                      Roles & Access Control
                    </Button>
                  </Link>
                  <Link href="/admin/audit">
                    <Button variant="outline" className="w-full justify-start text-xs h-9">
                      Security Audit Logs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white dark:bg-slate-900 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  AIUB Research Quick Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p>Step 1: Search CS Faculty with matching research tags (#NLP, #SE).</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p>Step 2: Submit a 2-step formal proposal with PDF/DOCX attachment.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p>Step 3: Once approved, work inside your shared collaborative workspace.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
