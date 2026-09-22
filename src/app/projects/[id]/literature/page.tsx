import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { LiteratureClient } from "./literature-client";
import { LiteratureItem } from "@/types/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LiteraturePage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/literature`);
  }

  const supabase = await createClient();

  // Fetch literature items for this project
  const { data: literature } = await supabase
    .from("literature_items")
    .select(`
      *,
      uploader:uploaded_by(id, full_name)
    `)
    .eq("project_id", id)
    .order("uploaded_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Literature Review Repository
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload research papers, tag folders, detect duplicates, and track what team members have read
        </p>
      </div>

      <LiteratureClient
        projectId={id}
        initialItems={(literature as LiteratureItem[]) || []}
      />
    </div>
  );
}
