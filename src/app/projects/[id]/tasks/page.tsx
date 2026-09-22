import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { TasksClient } from "./tasks-client";
import { Milestone, Task, ProjectMember } from "@/types/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TasksPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/tasks`);
  }

  const supabase = await createClient();

  // Fetch milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("due_date", { ascending: true });

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:assignee_id(id, full_name, university_email)
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // Fetch project members for assignee picker
  const { data: members } = await supabase
    .from("project_members")
    .select(`
      id,
      user_id,
      member_role,
      profile:user_id(id, full_name, university_email)
    `)
    .eq("project_id", id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Tasks & Research Milestones
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Organize thesis milestones, assign tasks to research partners, and track kanban workflow
        </p>
      </div>

      <TasksClient
        projectId={id}
        initialMilestones={(milestones as unknown as Milestone[]) || []}
        initialTasks={(tasks as unknown as Task[]) || []}
        members={(members as unknown as ProjectMember[]) || []}
      />
    </div>
  );
}
