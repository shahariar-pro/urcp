"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MeetingStatus } from "@/types/database.types";

export type CommActionState = {
  error?: string | null;
  success?: string | null;
};

export async function sendMessageAction(
  projectId: string,
  body: string,
  recipientId?: string | null
) {
  const cleanBody = body.trim();
  if (!cleanBody) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required.");

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      project_id: projectId,
      sender_id: user.id,
      recipient_id: recipientId || null,
      body: cleanBody,
    })
    .select(`
      *,
      sender:sender_id(id, full_name, role)
    `)
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/chat`);
  return message;
}

export async function proposeMeetingAction(
  prevState: CommActionState,
  formData: FormData
): Promise<CommActionState> {
  const projectId = formData.get("projectId") as string;
  const proposedTime = formData.get("proposedTime") as string;
  const location =
    (formData.get("location") as string)?.trim() || "Online (Teams / Zoom / Meet)";

  if (!projectId || !proposedTime) {
    return { error: "Please provide a meeting date and time." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase.from("meetings").insert({
    project_id: projectId,
    proposed_by: user.id,
    proposed_time: proposedTime,
    location,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}/calendar`);
  return { success: "Meeting slot proposed successfully." };
}

export async function updateMeetingStatusAction(
  meetingId: string,
  projectId: string,
  status: MeetingStatus
) {
  const supabase = await createClient();
  await supabase
    .from("meetings")
    .update({ status })
    .eq("id", meetingId);

  revalidatePath(`/projects/${projectId}/calendar`);
}

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  revalidatePath("/notifications");
}
