"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { diffLines, Change } from "diff";
import { restoreDocumentVersionAction } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  Split,
  FileText,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Props {
  projectId: string;
  document: any;
  versions: any[];
}

export function VersionsClient({ projectId, document, versions }: Props) {
  // Default to comparing the latest version with the previous version if available
  const [versionAId, setVersionAId] = useState<string>(
    versions.length > 1 ? versions[1].id : versions[0]?.id || ""
  );
  const [versionBId, setVersionBId] = useState<string>(
    versions.length > 0 ? versions[0].id : ""
  );

  const [isRestoring, setIsRestoring] = useState(false);

  const versionA = versions.find((v) => v.id === versionAId);
  const versionB = versions.find((v) => v.id === versionBId);

  // Compute text diff between Version A (Old) and Version B (New)
  const diffResult: Change[] = useMemo(() => {
    if (!versionA || !versionB) return [];
    return diffLines(versionA.content || "", versionB.content || "");
  }, [versionA, versionB]);

  const handleRestore = async (verId: string, verNum: number) => {
    if (
      !confirm(
        `Restore Version #${verNum}? This creates a new revision containing this content without deleting history.`
      )
    ) {
      return;
    }

    setIsRestoring(true);
    try {
      await restoreDocumentVersionAction(document.id, projectId, verId);
    } catch (err: any) {
      alert(`Could not restore: ${err.message}`);
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/documents/${document.id}`}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Version History: {document.title}
              </h2>
              <Badge variant="outline" className="text-[10px]">
                {versions.length} Revisions Logged
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare differences across revisions and safely restore past states without losing audit history
            </p>
          </div>
        </div>

        <Link href={`/projects/${projectId}/documents/${document.id}`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
            <FileText className="h-3.5 w-3.5" />
            Back to Editor
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version List (Col 1) */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-blue-600" />
                Audit Version Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 max-h-[600px] overflow-y-auto">
              {versions.map((ver) => {
                const isCurrent = document.current_version_id === ver.id;
                const isSelectedA = versionAId === ver.id;
                const isSelectedB = versionBId === ver.id;

                return (
                  <div
                    key={ver.id}
                    className={`p-3.5 rounded-lg border text-xs space-y-2 transition-all ${
                      isSelectedB
                        ? "border-blue-500 bg-blue-50/50 shadow-xs"
                        : isSelectedA
                        ? "border-amber-400 bg-amber-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          v{ver.version_number}
                        </span>
                        {isCurrent && (
                          <Badge variant="success" className="text-[9px]">
                            Current Active
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(ver.created_at)}
                      </span>
                    </div>

                    <p className="text-slate-600 font-medium italic">
                      &quot;{ver.change_summary || "Revision update"}&quot;
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{ver.author?.full_name || "Team Member"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setVersionAId(ver.id)}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer font-medium ${
                            isSelectedA
                              ? "bg-amber-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Base (A)
                        </button>
                        <button
                          onClick={() => setVersionBId(ver.id)}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer font-medium ${
                            isSelectedB
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Target (B)
                        </button>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() =>
                            handleRestore(ver.id, ver.version_number)
                          }
                          disabled={isRestoring}
                          className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Diff Comparison Viewer (Cols 2 & 3) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="py-3 px-5 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Split className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-bold text-slate-800">
                  Version Diff: v{versionA?.version_number || "A"} → v
                  {versionB?.version_number || "B"}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  + Additions
                </span>
                <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  - Deletions
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed divide-y divide-slate-50 bg-slate-900 text-slate-100 rounded-b-lg">
                {diffResult.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-12">
                    No differences found between selected versions.
                  </p>
                ) : (
                  diffResult.map((part, index) => {
                    if (part.added) {
                      return (
                        <div
                          key={index}
                          className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 whitespace-pre-wrap flex"
                        >
                          <span className="select-none text-emerald-500 font-bold mr-2">
                            +
                          </span>
                          <span>{part.value}</span>
                        </div>
                      );
                    }
                    if (part.removed) {
                      return (
                        <div
                          key={index}
                          className="bg-red-950/80 text-red-300 px-2 py-0.5 whitespace-pre-wrap flex"
                        >
                          <span className="select-none text-red-500 font-bold mr-2">
                            -
                          </span>
                          <span>{part.value}</span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={index}
                        className="text-slate-300 px-2 py-0.5 whitespace-pre-wrap flex opacity-85"
                      >
                        <span className="select-none text-slate-600 mr-2">
                          {" "}
                        </span>
                        <span>{part.value}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
