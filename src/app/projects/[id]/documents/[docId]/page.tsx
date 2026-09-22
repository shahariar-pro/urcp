import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { notFound, redirect } from "next/navigation";
import { EditorClient } from "./editor-client";

interface Props {
  params: Promise<{ id: string; docId: string }>;
}

export default async function DocumentEditorPage({ params }: Props) {
  const { id, docId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/documents/${docId}`);
  }

  const supabase = await createClient();

  // Fetch document with current version
  const { data: document } = await supabase
    .from("documents")
    .select(`
      *,
      current_version:current_version_id(*)
    `)
    .eq("id", docId)
    .single();

  if (!document) {
    notFound();
  }

  // Fetch comments for this document
  const { data: comments } = await supabase
    .from("document_comments")
    .select(`
      *,
      author:author_id(id, full_name, university_email, role)
    `)
    .eq("document_id", docId)
    .order("created_at", { ascending: false });

  return (
    <EditorClient
      projectId={id}
      document={document}
      initialComments={comments || []}
      currentUserId={profile.id}
    />
  );
}
