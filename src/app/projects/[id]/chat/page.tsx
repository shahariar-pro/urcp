import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { ChatClient } from "./chat-client";
import { Message } from "@/types/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectChatPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/chat`);
  }

  const supabase = await createClient();

  // Fetch recent messages for this project
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id(id, full_name, role, university_email)
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Collaborative Project Discussion
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Private communication thread between supervisor and student group members
        </p>
      </div>

      <ChatClient
        projectId={id}
        initialMessages={(messages as Message[]) || []}
        currentUser={profile}
      />
    </div>
  );
}
