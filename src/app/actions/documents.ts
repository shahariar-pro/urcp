"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CommentStatus } from "@/types/database.types";

export type DocActionState = {
  error?: string | null;
  success?: string | null;
};

export async function createDocumentAction(
  prevState: DocActionState,
  formData: FormData
): Promise<DocActionState> {
  const projectId = formData.get("projectId") as string;
  const title = (formData.get("title") as string)?.trim();
  const initialContent =
    (formData.get("initialContent") as string)?.trim() ||
    `# ${title}\n\n## 1. Introduction\nWrite your initial draft here...`;

  if (!projectId || !title) {
    return { error: "Document title is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User authentication required." };
  }

  // 1. Create document record
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      project_id: projectId,
      title,
    })
    .select("id")
    .single();

  if (docError || !doc) {
    return { error: docError?.message || "Failed to create document." };
  }

  // 2. Create initial version (Version 1)
  const { data: version, error: verError } = await supabase
    .from("document_versions")
    .insert({
      document_id: doc.id,
      content: initialContent,
      version_number: 1,
      saved_by: user.id,
      change_summary: "Initial draft creation",
    })
    .select("id")
    .single();

  if (verError || !version) {
    return { error: verError?.message || "Failed to create version 1." };
  }

  // 3. Link current version
  await supabase
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", doc.id);

  revalidatePath(`/projects/${projectId}/documents`);
  redirect(`/projects/${projectId}/documents/${doc.id}`);
}

export async function saveDocumentVersionAction(
  documentId: string,
  projectId: string,
  content: string,
  changeSummary?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  // Query latest version number
  const { data: latestVersions } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersionNum =
    latestVersions && latestVersions.length > 0
      ? latestVersions[0].version_number + 1
      : 1;

  // Insert NEW version row (never mutate previous versions per SRS requirement)
  const { data: newVersion, error: verError } = await supabase
    .from("document_versions")
    .insert({
      document_id: documentId,
      content,
      version_number: nextVersionNum,
      saved_by: user.id,
      change_summary: changeSummary || `Revision ${nextVersionNum}`,
    })
    .select("id")
    .single();

  if (verError || !newVersion) {
    throw new Error(verError?.message || "Failed to save new version.");
  }

  // Update current version pointer
  await supabase
    .from("documents")
    .update({ current_version_id: newVersion.id })
    .eq("id", documentId);

  revalidatePath(`/projects/${projectId}/documents/${documentId}`);
  revalidatePath(`/projects/${projectId}/documents/${documentId}/versions`);
  return newVersion;
}

export async function restoreDocumentVersionAction(
  documentId: string,
  projectId: string,
  targetVersionId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  // Fetch content of target version
  const { data: targetVersion } = await supabase
    .from("document_versions")
    .select("content, version_number")
    .eq("id", targetVersionId)
    .single();

  if (!targetVersion) {
    throw new Error("Target version to restore was not found.");
  }

  // Get current highest version number
  const { data: latest } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersionNum = latest && latest.length > 0 ? latest[0].version_number + 1 : 1;

  // Create new version containing the restored content (never delete history)
  const { data: newVer, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: documentId,
      content: targetVersion.content,
      version_number: nextVersionNum,
      saved_by: user.id,
      change_summary: `Restored from Version #${targetVersion.version_number}`,
    })
    .select("id")
    .single();

  if (error || !newVer) {
    throw new Error(error?.message || "Restore operation failed.");
  }

  await supabase
    .from("documents")
    .update({ current_version_id: newVer.id })
    .eq("id", documentId);

  revalidatePath(`/projects/${projectId}/documents/${documentId}`);
  revalidatePath(`/projects/${projectId}/documents/${documentId}/versions`);
  redirect(`/projects/${projectId}/documents/${documentId}`);
}

export async function addDocumentCommentAction(
  documentId: string,
  projectId: string,
  versionId: string | null,
  sectionRef: string | null,
  body: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required.");

  await supabase.from("document_comments").insert({
    document_id: documentId,
    version_id: versionId,
    author_id: user.id,
    section_ref: sectionRef,
    body,
    status: "open",
  });

  revalidatePath(`/projects/${projectId}/documents/${documentId}`);
}

export async function toggleCommentStatusAction(
  commentId: string,
  projectId: string,
  documentId: string,
  nextStatus: CommentStatus
) {
  const supabase = await createClient();
  await supabase
    .from("document_comments")
    .update({ status: nextStatus })
    .eq("id", commentId);

  revalidatePath(`/projects/${projectId}/documents/${documentId}`);
}
