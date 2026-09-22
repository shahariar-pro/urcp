"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { createDocumentAction } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, GitBranch, ArrowRight, Clock, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  projectId: string;
  initialDocs: any[];
}

export function DocumentsListClient({ projectId, initialDocs }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createDocumentAction, {
    error: null,
    success: null,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-xs text-slate-500 font-medium">
          {initialDocs.length} Research Documents
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 text-xs h-9 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Document
        </Button>
      </div>

      {isCreateOpen && (
        <Card className="border-blue-200 bg-white shadow-md animate-in fade-in duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              New Research Document Draft
            </CardTitle>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-4">
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="projectId" value={projectId} />
              {state?.error && (
                <p className="text-xs text-red-600">{state.error}</p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  placeholder="e.g. Chapter 1: Introduction and Research Background"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Initial Outline / Content (Optional)
                </label>
                <Textarea
                  name="initialContent"
                  placeholder="Type initial draft or outline here..."
                  rows={4}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Draft"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {initialDocs.length === 0 ? (
        <Card className="border-dashed bg-white">
          <CardContent className="p-12 text-center text-slate-500 space-y-3">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              No documents created yet
            </p>
            <p className="text-xs text-slate-400">
              Draft your thesis sections directly in URCP with versioning, supervisor annotations, and diff tracking.
            </p>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="mt-2"
            >
              Create First Draft
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {initialDocs.map((doc) => {
            const ver = doc.current_version;
            return (
              <Card
                key={doc.id}
                className="bg-white hover:border-slate-300 transition-all shadow-2xs"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {doc.title}
                      </h3>
                      <Badge variant="secondary" className="text-[10px]">
                        v{ver?.version_number || 1}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500">
                      Last revision by{" "}
                      <span className="font-semibold text-slate-700">
                        {ver?.author?.full_name || "Team member"}
                      </span>{" "}
                      • {formatDate(ver?.created_at || doc.created_at)}
                      {ver?.change_summary && (
                        <span className="italic text-slate-400">
                          {" "}
                          ({ver.change_summary})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/projects/${projectId}/documents/${doc.id}/versions`}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-8"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        Version History
                      </Button>
                    </Link>

                    <Link href={`/projects/${projectId}/documents/${doc.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs h-8">
                        Edit Draft
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
