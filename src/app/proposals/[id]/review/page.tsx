import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ProposalReviewForm } from "./review-form";
import {
  FileText,
  User,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProposalReviewPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=/proposals/${id}/review`);
  }

  const supabase = await createClient();

  // Fetch proposal with submitter, attachments, and past decisions
  const { data: proposal } = await supabase
    .from("proposals")
    .select(`
      *,
      submitter:submitted_by(id, full_name, university_email, department),
      supervisor:supervisor_id(id, full_name, university_email),
      attachments:proposal_attachments(*),
      decisions:proposal_decisions(
        *,
        decider:decided_by(id, full_name)
      )
    `)
    .eq("id", id)
    .single();

  if (!proposal) {
    notFound();
  }

  const isSupervisor =
    proposal.supervisor_id === profile.id || profile.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-5xl px-4 py-8 flex-1 space-y-6">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                Proposal ID: {proposal.id.slice(0, 8)}
              </Badge>
              {proposal.status === "approved" && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Approved
                </Badge>
              )}
              {proposal.status === "submitted" && (
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="h-3 w-3" /> Awaiting Review
                </Badge>
              )}
              {proposal.status === "changes_requested" && (
                <Badge variant="warning" className="gap-1 bg-orange-100 text-orange-800">
                  Changes Requested
                </Badge>
              )}
              {proposal.status === "rejected" && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" /> Rejected
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {proposal.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400" />
              <span>{proposal.submitter?.full_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{formatDate(proposal.submitted_at)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main proposal details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Abstract</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {proposal.abstract}
                </p>
              </CardContent>
            </Card>

            {proposal.objectives && (
              <Card className="bg-white shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Objectives & Methodologies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {proposal.objectives}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            <Card className="bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Submitted Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!proposal.attachments || proposal.attachments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No attachments uploaded.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {proposal.attachments.map((att: any) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {att.file_name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {(att.file_size / (1024 * 1024)).toFixed(2)} MB • Validated
                            </p>
                          </div>
                        </div>
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1.5 rounded border border-slate-200 shadow-xs"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Decision History Audit Log */}
            <Card className="bg-white shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-base font-semibold">
                    Decision Audit Log (Immutable)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {!proposal.decisions || proposal.decisions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No decisions logged yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {proposal.decisions.map((dec: any) => (
                      <div
                        key={dec.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold capitalize text-slate-900">
                            Decision: {dec.decision.replace("_", " ")}
                          </span>
                          <span className="text-slate-400">
                            {formatDateTime(dec.decided_at)}
                          </span>
                        </div>
                        <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                          {dec.feedback}
                        </p>
                        <p className="text-[11px] text-slate-400 text-right">
                          Decided by: {dec.decider?.full_name || "Supervisor"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Supervisor Review Actions */}
          <div className="space-y-6">
            <Card className="bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Author & Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Student Author
                  </span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">
                    {proposal.submitter?.full_name}
                  </p>
                  <p className="text-slate-500">
                    {proposal.submitter?.university_email}
                  </p>
                  <p className="text-slate-500">
                    {proposal.submitter?.department}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Assigned Faculty Supervisor
                  </span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">
                    {proposal.supervisor?.full_name}
                  </p>
                  <p className="text-slate-500">
                    {proposal.supervisor?.university_email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {isSupervisor ? (
              <ProposalReviewForm
                proposalId={proposal.id}
                currentStatus={proposal.status}
              />
            ) : (
              <div className="p-4 rounded-lg bg-slate-100 text-xs text-slate-500 text-center">
                Review actions are restricted to the assigned supervisor and department administrators.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
