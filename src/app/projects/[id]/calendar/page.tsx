import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { CalendarClient } from "./calendar-client";
import { Meeting } from "@/types/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CalendarPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/calendar`);
  }

  const supabase = await createClient();

  // Fetch meetings for this project
  const { data: meetings } = await supabase
    .from("meetings")
    .select(`
      *,
      proposer:proposed_by(id, full_name, role)
    `)
    .eq("project_id", id)
    .order("proposed_time", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Shared Meeting Schedule & Calendar
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Propose supervisor check-in slots, confirm thesis defense milestones, and track meeting locations
        </p>
      </div>

      <CalendarClient
        projectId={id}
        initialMeetings={(meetings as Meeting[]) || []}
        currentUserId={profile.id}
      />
    </div>
  );
}
