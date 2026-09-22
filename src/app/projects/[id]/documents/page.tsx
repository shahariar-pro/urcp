import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, GitBranch, ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DocumentsListClient } from "./documents-list-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DocumentsPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/projects/${id}/documents`);
  }

  const supabase = await createClient();

  // Fetch documents with their latest version info
  const { data: documents } = await supabase
    .from("documents")
    .select(`
      *,
      current_version:current_version_id(
        id,
        version_number,
        change_summary,
        created_at,
        author:saved_by(full_name)
      )
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Drafts & Research Documents
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Thesis chapters, methodology reports, inline supervisor comments, and 10+ version diff history
        </p>
      </div>

      <DocumentsListClient projectId={id} initialDocs={documents || []} />
    </div>
  );
}
