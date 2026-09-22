import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Proposal, ProposalStatus } from "@/types/database.types";
import { FileText, Plus, ArrowUpRight, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default async function ProposalsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/proposals");
  }

  const supabase = await createClient();

  // Fetch proposals submitted by user
  const { data: submittedProposals } = await supabase
    .from("proposals")
    .select(`
      *,
      supervisor:supervisor_id(id, full_name, university_email),
      attachments:proposal_attachments(id, file_name, file_size)
    `)
    .eq("submitted_by", profile.id)
    .order("submitted_at", { ascending: false });

  // If faculty or admin, also fetch proposals assigned to them for review
  const { data: reviewProposals } = await supabase
    .from("proposals")
    .select(`
      *,
      submitter:submitted_by(id, full_name, university_email),
      attachments:proposal_attachments(id, file_name, file_size)
    `)
    .eq("supervisor_id", profile.id)
    .order("submitted_at", { ascending: false });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case "submitted":
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Under Review</Badge>;
      case "changes_requested":
        return <Badge variant="warning" className="gap-1 bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-900/60"><AlertCircle className="h-3 w-3" /> Changes Requested</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-6xl px-4 py-8 flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Research Proposals
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Submit, track, and review undergraduate research topics
            </p>
          </div>

          <Link href="/proposals/new">
            <Button className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Submit New Proposal
            </Button>
          </Link>
        </div>

        {/* Section: Proposals Awaiting Supervisor Review (if faculty/admin) */}
        {(profile.role === "faculty" || profile.role === "admin") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Assigned Proposals for Review ({reviewProposals?.length || 0})
              </h2>
            </div>

            {(!reviewProposals || reviewProposals.length === 0) ? (
              <Card className="border-dashed bg-white dark:bg-slate-900/40">
                <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">No pending proposals assigned for your review.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reviewProposals.map((prop: Proposal) => (
                  <Card key={prop.id} className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base text-slate-900 dark:text-white font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Link href={`/proposals/${prop.id}/review`} className="flex items-center gap-1.5">
                              {prop.title}
                              <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </Link>
                          </CardTitle>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Submitted by: <span className="font-semibold text-slate-700 dark:text-slate-300">{prop.submitter?.full_name || "Student"}</span> ({prop.submitter?.university_email}) • {formatDate(prop.submitted_at)}
                          </p>
                        </div>
                        <div>{getStatusBadge(prop.status)}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-2">
                        {prop.abstract}
                      </p>
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {prop.attachments?.length || 0} attachment(s)
                        </span>
                        <Link href={`/proposals/${prop.id}/review`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            Review Decision
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: Student's Submitted Proposals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              My Research Proposals ({submittedProposals?.length || 0})
            </h2>
          </div>

          {(!submittedProposals || submittedProposals.length === 0) ? (
            <Card className="border-dashed bg-white dark:bg-slate-900/40">
              <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-3">
                <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No proposals submitted yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit your first research topic to begin supervisor collaboration.</p>
                </div>
                <Link href="/proposals/new">
                  <Button size="sm" className="mt-2">
                    Submit Proposal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submittedProposals.map((prop: Proposal) => (
                <Card key={prop.id} className="bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base text-slate-900 dark:text-white font-bold">
                          {prop.title}
                        </CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Supervisor: <span className="font-semibold text-slate-700 dark:text-slate-300">{prop.supervisor?.full_name || "Assigned Faculty"}</span> • Submitted {formatDate(prop.submitted_at)}
                        </p>
                      </div>
                      <div>{getStatusBadge(prop.status)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-2">
                      {prop.abstract}
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {prop.attachments?.length || 0} document attached
                      </span>
                      {prop.status === "approved" && prop.project_id && (
                        <Link href={`/projects/${prop.project_id}`}>
                          <Button size="sm" className="gap-1 text-xs">
                            Open Project Workspace →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
