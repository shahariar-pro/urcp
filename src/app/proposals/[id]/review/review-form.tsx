"use client";

import { useState, useActionState } from "react";
import { ProposalStatus, DecisionType } from "@/types/database.types";
import { decideProposalAction } from "@/app/actions/proposals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

interface Props {
  proposalId: string;
  currentStatus: ProposalStatus;
}

export function ProposalReviewForm({ proposalId, currentStatus }: Props) {
  const [selectedDecision, setSelectedDecision] =
    useState<DecisionType>("approved");
  const [feedback, setFeedback] = useState("");

  const [state, formAction, isPending] = useActionState(decideProposalAction, {
    error: null,
    success: null,
  });

  return (
    <Card className="border-blue-200 bg-white shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 bg-blue-50/40 rounded-t-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-base font-semibold text-blue-950">
            Supervisor Decision
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {state?.error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p>{state.success}</p>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="proposalId" value={proposalId} />
          <input type="hidden" name="decision" value={selectedDecision} />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Formal Action
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDecision("approved")}
                className={`py-2 px-2 text-xs font-semibold rounded-md border text-center transition-all cursor-pointer ${
                  selectedDecision === "approved"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setSelectedDecision("changes_requested")}
                className={`py-2 px-2 text-xs font-semibold rounded-md border text-center transition-all cursor-pointer ${
                  selectedDecision === "changes_requested"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Changes
              </button>
              <button
                type="button"
                onClick={() => setSelectedDecision("rejected")}
                className={`py-2 px-2 text-xs font-semibold rounded-md border text-center transition-all cursor-pointer ${
                  selectedDecision === "rejected"
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Reject
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>
                Formal Feedback{" "}
                {selectedDecision !== "approved" && (
                  <span className="text-red-500">* (Mandatory)</span>
                )}
              </span>
            </label>
            <Textarea
              name="feedback"
              placeholder={
                selectedDecision === "approved"
                  ? "Optional congratulations or initial workspace instructions..."
                  : "Detail the specific improvements, literature citations, or methodology revisions required..."
              }
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required={selectedDecision !== "approved"}
              className="text-xs"
            />
            {selectedDecision !== "approved" && (
              <p className="text-[11px] text-slate-400">
                SRS Requirement: Feedback is mandatory and permanently saved to the immutable audit trail.
              </p>
            )}
          </div>

          <Button
            type="submit"
            className={`w-full text-xs font-semibold h-9 ${
              selectedDecision === "approved"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : selectedDecision === "changes_requested"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
            disabled={
              isPending ||
              (selectedDecision !== "approved" && feedback.trim().length < 5)
            }
          >
            {isPending
              ? "Submitting Decision..."
              : selectedDecision === "approved"
              ? "Confirm & Create Workspace"
              : selectedDecision === "changes_requested"
              ? "Submit Changes Request"
              : "Confirm Rejection"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
