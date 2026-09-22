"use client";

import { useState } from "react";
import Link from "next/link";
import {
  saveDocumentVersionAction,
  addDocumentCommentAction,
  toggleCommentStatusAction,
} from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  GitBranch,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
  Check,
  Send,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Props {
  projectId: string;
  document: any;
  initialComments: any[];
  currentUserId: string;
}

export function EditorClient({
  projectId,
  document,
  initialComments,
  currentUserId,
}: Props) {
  const currentVersion = document.current_version;
  const [content, setContent] = useState(currentVersion?.content || "");
  const [changeSummary, setChangeSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState(initialComments);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [sectionRef, setSectionRef] = useState("");
  const [commentFilter, setCommentFilter] = useState<"all" | "open" | "resolved">("open");

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = content.split("\n").length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveDocumentVersionAction(
        document.id,
        projectId,
        content,
        changeSummary || `Updated draft revision`
      );
      setSaveMessage("Saved as new immutable version!");
      setChangeSummary("");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    try {
      await addDocumentCommentAction(
        document.id,
        projectId,
        currentVersion?.id || null,
        sectionRef || null,
        newCommentBody
      );

      setComments((prev) => [
        {
          id: `tmp-${Date.now()}`,
          body: newCommentBody,
          section_ref: sectionRef || null,
          status: "open",
          created_at: new Date().toISOString(),
          author: { full_name: "You" },
        },
        ...prev,
      ]);

      setNewCommentBody("");
      setSectionRef("");
    } catch (err: any) {
      alert(`Could not add comment: ${err.message}`);
    }
  };

  const handleToggleComment = async (commentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "resolved" ? "open" : "resolved";
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: nextStatus } : c))
    );
    await toggleCommentStatusAction(commentId, projectId, document.id, nextStatus as any);
  };

  const filteredComments = comments.filter((c) => {
    if (commentFilter === "open") return c.status === "open";
    if (commentFilter === "resolved") return c.status === "resolved";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/documents`}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {document.title}
              </h2>
              <Badge variant="default" className="text-[10px]">
                Version {currentVersion?.version_number || 1}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {wordCount} words • {lineCount} lines • Saved {formatDateTime(currentVersion?.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/projects/${projectId}/documents/${document.id}/versions`}
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Compare & Versions
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving Version..." : "Save Revision"}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div
          className={`p-3 text-xs rounded-lg border ${
            saveMessage.startsWith("Error")
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Editor & Comments Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Text Editor (Col 1 & 2) */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="py-2.5 px-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50 rounded-t-lg">
              <span className="text-xs font-semibold text-slate-600">
                Markdown Document Editor
              </span>
              <div className="text-[11px] text-slate-400">
                Every save retains a permanent historical version
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={24}
                className="w-full border-0 rounded-none rounded-b-lg p-5 font-mono text-xs leading-relaxed focus-visible:ring-0 focus-visible:border-0 resize-y"
                placeholder="# Introduction..."
              />
            </CardContent>
          </Card>

          {/* Change Summary Input */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
            <Input
              placeholder="Summary of changes (e.g. Added section 2.1 or updated references)..."
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              className="text-xs h-9"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs h-9 shrink-0"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Inline Supervisor & Team Comments (Col 3) */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Supervisor & Team Notes
                </CardTitle>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setCommentFilter("open")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      commentFilter === "open"
                        ? "bg-blue-600 text-white font-medium"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setCommentFilter("resolved")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      commentFilter === "resolved"
                        ? "bg-blue-600 text-white font-medium"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <Input
                  placeholder="Section Anchor (e.g. Section 1.2 or Methodology)..."
                  value={sectionRef}
                  onChange={(e) => setSectionRef(e.target.value)}
                  className="text-xs h-8"
                />
                <Textarea
                  placeholder="Write a review note or comment for your team..."
                  value={newCommentBody}
                  onChange={(e) => setNewCommentBody(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newCommentBody.trim()}
                  className="w-full text-xs h-8 gap-1"
                >
                  <Send className="h-3 w-3" />
                  Post Comment
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredComments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No {commentFilter} comments on this document.
                  </p>
                ) : (
                  filteredComments.map((c) => {
                    const isResolved = c.status === "resolved";
                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-lg border text-xs space-y-2 transition-colors ${
                          isResolved
                            ? "bg-slate-50 border-slate-200 opacity-70"
                            : "bg-blue-50/40 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-slate-800">
                              {c.author?.full_name || "Author"}
                            </span>
                            {c.section_ref && (
                              <span className="block text-[10px] text-blue-600 font-medium">
                                Anchor: {c.section_ref}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(c.created_at)}
                          </span>
                        </div>

                        <p className="text-slate-700 whitespace-pre-wrap">
                          {c.body}
                        </p>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleComment(c.id, c.status)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${
                              isResolved
                                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {isResolved ? "Reopen" : "Mark Resolved"}
                          </button>
                        </div>
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
