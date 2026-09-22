import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { notFound, redirect } from "next/navigation";
import { VersionsClient } from "./versions-client";

interface Props {
  params: Promise<{ id: string; docId: string }>;
}

export default async function VersionsPage({ params }: Props) {
  const { id, docId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/documents/${docId}/versions`);
  }

  const supabase = await createClient();

  // Fetch document details
  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .single();

  if (!document) {
    notFound();
  }

  // Fetch at least the last 10 versions (ordered newest to oldest)
  const { data: versions } = await supabase
    .from("document_versions")
    .select(`
      *,
      author:saved_by(id, full_name, university_email)
    `)
    .eq("document_id", docId)
    .order("version_number", { ascending: false })
    .limit(20);

  return (
    <VersionsClient
      projectId={id}
      document={document}
      versions={versions || []}
    />
  );
}
