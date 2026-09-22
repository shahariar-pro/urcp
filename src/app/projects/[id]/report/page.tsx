import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { notFound, redirect } from "next/navigation";
import { ReportClient } from "./report-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectReportPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/report`);
  }

  const supabase = await createClient();

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      supervisor:supervisor_id(id, full_name, university_email, department),
      members:project_members(
        member_role,
        profile:user_id(id, full_name, university_email)
      )
    `)
    .eq("id", id)
    .single();

  if (!project) notFound();

  // Fetch milestones & tasks
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("due_date", { ascending: true });

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id);

  // Fetch literature items
  const { data: literature } = await supabase
    .from("literature_items")
    .select("*")
    .eq("project_id", id);

  // Fetch unresolved comments count
  const { count: openCommentsCount } = await supabase
    .from("document_comments")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  return (
    <ReportClient
      project={project}
      milestones={milestones || []}
      tasks={tasks || []}
      literature={literature || []}
      openCommentsCount={openCommentsCount || 0}
    />
  );
}
