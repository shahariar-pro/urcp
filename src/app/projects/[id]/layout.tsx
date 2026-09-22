import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { WorkspaceNav } from "./workspace-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileDown } from "lucide-react";

interface Props {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}`);
  }

  const supabase = await createClient();

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      members:project_members(
        id,
        member_role,
        profile:user_id(id, full_name, role, university_email)
      )
    `)
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userProfile={profile} />

      {/* Project Header Banner */}
      <div className="border-b border-slate-200 bg-white shadow-2xs">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  AIUB CS Research Workspace
                </Badge>
                <Badge
                  variant={
                    project.status === "active"
                      ? "success"
                      : project.status === "completed"
                      ? "default"
                      : "secondary"
                  }
                  className="capitalize text-xs"
                >
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {project.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href={`/projects/${id}/report`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <FileDown className="h-3.5 w-3.5" />
                  Progress Report
                </Button>
              </Link>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Overall Progress</span>
                  <span className="text-sm font-bold text-blue-600">
                    {project.progress_percent}%
                  </span>
                </div>
                <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress_percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-navigation tabs */}
          <div className="mt-6">
            <WorkspaceNav projectId={id} />
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {children}
      </main>
    </div>
  );
}
