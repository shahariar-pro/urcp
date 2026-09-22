"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { TaskStatus, MilestoneStatus } from "@/types/database.types";

export type TaskActionState = {
  error?: string | null;
  success?: string | null;
};

export async function createMilestoneAction(
  prevState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const projectId = formData.get("projectId") as string;
  const title = (formData.get("title") as string)?.trim();
  const dueDate = formData.get("dueDate") as string;

  if (!projectId || !title || !dueDate) {
    return { error: "Milestone title and due date are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    title,
    due_date: dueDate,
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}/tasks`);
  return { success: "Milestone created successfully." };
}

export async function createTaskAction(
  prevState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const projectId = formData.get("projectId") as string;
  const title = (formData.get("title") as string)?.trim();
  const milestoneId = (formData.get("milestoneId") as string) || null;
  const assigneeId = (formData.get("assigneeId") as string) || null;
  const dueDate = (formData.get("dueDate") as string) || null;

  if (!projectId || !title) {
    return { error: "Task title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    title,
    milestone_id: milestoneId,
    assignee_id: assigneeId,
    due_date: dueDate,
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}/tasks`);
  return { success: "Task created successfully." };
}

export async function updateTaskStatusAction(
  taskId: string,
  projectId: string,
  newStatus: TaskStatus
) {
  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);

  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}`);
}
