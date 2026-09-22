"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { LiteratureStatus } from "@/types/database.types";

export type LiteratureActionState = {
  error?: string | null;
  success?: string | null;
};

export async function addLiteratureItemAction(
  prevState: LiteratureActionState,
  formData: FormData
): Promise<LiteratureActionState> {
  const projectId = formData.get("projectId") as string;
  const title = (formData.get("title") as string)?.trim();
  const authors = (formData.get("authors") as string)?.trim();
  const folderTag = (formData.get("folderTag") as string)?.trim() || "General";
  const file = formData.get("attachment") as File | null;
  const isDuplicateWarningIgnored = formData.get("ignoreDuplicateWarning") === "true";

  if (!projectId || !title || !authors) {
    return { error: "Title and author(s) are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  let fileUrl: string | null = null;

  if (file && file.size > 0) {
    if (file.size > 25 * 1024 * 1024) {
      return { error: "File exceeds maximum size of 25MB." };
    }

    const path = `${projectId}/lit_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("literature")
      .upload(path, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("literature").getPublicUrl(path);
      fileUrl = data.publicUrl || path;
    }
  }

  const { error } = await supabase.from("literature_items").insert({
    project_id: projectId,
    title,
    authors,
    folder_tag: folderTag,
    file_url: fileUrl,
    uploaded_by: user.id,
    status: isDuplicateWarningIgnored ? "possible_duplicate" : "unread",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}/literature`);
  return { success: "Literature item successfully added to repository." };
}

export async function updateLiteratureStatusAction(
  itemId: string,
  projectId: string,
  newStatus: LiteratureStatus
) {
  const supabase = await createClient();
  await supabase
    .from("literature_items")
    .update({ status: newStatus })
    .eq("id", itemId);

  revalidatePath(`/projects/${projectId}/literature`);
}

export async function deleteLiteratureItemAction(
  itemId: string,
  projectId: string
) {
  const supabase = await createClient();
  await supabase.from("literature_items").delete().eq("id", itemId);
  revalidatePath(`/projects/${projectId}/literature`);
}
