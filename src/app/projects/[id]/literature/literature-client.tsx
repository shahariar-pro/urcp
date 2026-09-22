"use client";

import { useState, useMemo, useActionState } from "react";
import { LiteratureItem, LiteratureStatus } from "@/types/database.types";
import { findDuplicateTitle } from "@/lib/fuzzy";
import {
  addLiteratureItemAction,
  updateLiteratureStatusAction,
  deleteLiteratureItemAction,
} from "@/app/actions/literature";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Trash2,
  Folder,
  Tag,
  Check,
  Clock,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  projectId: string;
  initialItems: LiteratureItem[];
}

export function LiteratureClient({ projectId, initialItems }: Props) {
  const [items, setItems] = useState<LiteratureItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form states for upload & duplicate checking
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAuthors, setUploadAuthors] = useState("");
  const [uploadFolder, setUploadFolder] = useState("Related Work");
  const [ignoreWarning, setIgnoreWarning] = useState(false);

  const [state, formAction, isPending] = useActionState(
    addLiteratureItemAction,
    {
      error: null,
      success: null,
    }
  );

  // Check for duplicate title whenever uploadTitle changes
  const duplicateCheck = useMemo(() => {
    if (!uploadTitle.trim() || uploadTitle.length < 5) {
      return { isDuplicate: false, score: 0 };
    }
    return findDuplicateTitle(uploadTitle, items, 0.7);
  }, [uploadTitle, items]);

  // Extract unique folder tags
  const folderTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach((item) => {
      if (item.folder_tag) tags.add(item.folder_tag);
    });
    return Array.from(tags);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.folder_tag &&
          item.folder_tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFolder =
        selectedFolder === "all" || item.folder_tag === selectedFolder;

      return matchesSearch && matchesFolder;
    });
  }, [items, searchQuery, selectedFolder]);

  const handleToggleStatus = async (item: LiteratureItem) => {
    const nextStatus: LiteratureStatus =
      item.status === "reviewed" ? "unread" : "reviewed";
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );
    await updateLiteratureStatusAction(item.id, projectId, nextStatus);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this paper from the workspace?")) {
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await deleteLiteratureItemAction(itemId, projectId);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search literature by paper title, authors, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedFolder("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                selectedFolder === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Folders
            </button>
            {folderTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedFolder(tag)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedFolder === tag
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          className="gap-1.5 text-xs h-9 shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          Upload Research Paper
        </Button>
      </div>

      {/* Upload Modal / Form */}
      {isUploadOpen && (
        <Card className="border-blue-200 bg-white shadow-md animate-in fade-in duration-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Upload Literature Item
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {state?.error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                {state.error}
              </div>
            )}

            {/* DUPLICATE WARNING ALERT (Warn, don't block per SRS §6 Scope 2) */}
            {duplicateCheck.isDuplicate && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                      Possible Duplicate Detected ({duplicateCheck.score}% similarity)
                    </h4>
                    <p className="text-xs mt-1">
                      A paper with a very similar title is already saved in this repository:
                    </p>
                    <p className="text-xs font-semibold mt-1 italic text-slate-800 bg-white/70 p-2 rounded border border-amber-200">
                      &quot;{duplicateCheck.match?.title}&quot; (by {duplicateCheck.match?.authors})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="ignoreWarning"
                    checked={ignoreWarning}
                    onChange={(e) => setIgnoreWarning(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <label htmlFor="ignoreWarning" className="text-xs text-amber-800 font-medium">
                    This is a different paper / edition. Allow upload anyway.
                  </label>
                </div>
              </div>
            )}

            <form
              action={formAction}
              onSubmit={() => {
                setTimeout(() => setIsUploadOpen(false), 500);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="projectId" value={projectId} />
              <input
                type="hidden"
                name="ignoreDuplicateWarning"
                value={ignoreWarning ? "true" : "false"}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Paper Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  placeholder="e.g. Attention Is All You Need"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Author(s) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="authors"
                    placeholder="e.g. Vaswani et al., 2017"
                    value={uploadAuthors}
                    onChange={(e) => setUploadAuthors(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Folder Tag
                  </label>
                  <Input
                    name="folderTag"
                    placeholder="e.g. Related Work, Methodology, Dataset"
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  PDF / DOCX Document (Max 25 MB)
                </label>
                <Input
                  type="file"
                  name="attachment"
                  accept=".pdf,.docx,.doc"
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isPending ||
                    !uploadTitle.trim() ||
                    !uploadAuthors.trim() ||
                    (duplicateCheck.isDuplicate && !ignoreWarning)
                  }
                >
                  {isPending ? "Adding..." : "Add to Repository"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Literature List */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed bg-white">
          <CardContent className="p-12 text-center text-slate-500 space-y-3">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              No literature items found
            </p>
            <p className="text-xs text-slate-400">
              Upload papers to share reading notes and track reviewed literature with your team.
            </p>
            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="mt-2"
            >
              Upload Paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item) => {
            const isReviewed = item.status === "reviewed";
            const isDuplicateFlagged = item.status === "possible_duplicate";

            return (
              <Card
                key={item.id}
                className="bg-white hover:border-slate-300 transition-all shadow-2xs"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={isReviewed ? "success" : "secondary"}
                        className="text-[10px] gap-1 cursor-pointer"
                        onClick={() => handleToggleStatus(item)}
                      >
                        {isReviewed ? (
                          <>
                            <Check className="h-3 w-3" /> Reviewed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" /> Unread
                          </>
                        )}
                      </Badge>

                      {item.folder_tag && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          <Folder className="h-3 w-3 text-slate-400" />
                          {item.folder_tag}
                        </span>
                      )}

                      {isDuplicateFlagged && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="h-3 w-3" /> Possible Duplicate
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Authors: <span className="text-slate-700 font-medium">{item.authors}</span> • Uploaded {formatDate(item.uploaded_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(item)}
                      className="text-xs h-8 gap-1.5"
                    >
                      {isReviewed ? "Mark Unread" : "Mark Reviewed"}
                    </Button>

                    {item.file_url ? (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 px-3 h-8 rounded-md border border-blue-200 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic px-2">
                        No attachment
                      </span>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete from repository"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
