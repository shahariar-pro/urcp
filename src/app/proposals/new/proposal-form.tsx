"use client";

import { useState, useActionState } from "react";
import { FacultyDirectoryItem } from "@/types/database.types";
import { submitProposalAction } from "@/app/actions/proposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertCircle,
  FileUp,
  UserCheck,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";

interface ProposalFormProps {
  facultyMembers: FacultyDirectoryItem[];
}

export function ProposalForm({ facultyMembers }: ProposalFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [objectives, setObjectives] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [facultySearch, setFacultySearch] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(submitProposalAction, {
    error: null,
    success: null,
  });

  const filteredFaculty = facultyMembers.filter(
    (f) =>
      f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.email.toLowerCase().includes(facultySearch.toLowerCase()) ||
      (f.research_interests &&
        f.research_interests.some((ri) =>
          ri.toLowerCase().includes(facultySearch.toLowerCase())
        ))
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError("File exceeds 25 MB limit.");
      setFileName(null);
      e.target.value = "";
      return;
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx") && !name.endsWith(".doc")) {
      setFileError("Only PDF and DOCX documents are accepted.");
      setFileName(null);
      e.target.value = "";
      return;
    }

    setFileName(file.name);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) {
      return;
    }
    setStep(2);
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              {step === 1 ? "Step 1: Research Project Scope" : "Step 2: Supervisor & Attachment"}
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">
              {step === 1
                ? "Provide the project title, abstract, and core research objectives."
                : "Select an AIUB faculty supervisor and attach your proposal document."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            <span>Step {step} of 2</span>
          </div>
        </div>
      </CardHeader>

      <form action={formAction}>
        {/* Hidden inputs to preserve step 1 data across form submission */}
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="abstract" value={abstract} />
        <input type="hidden" name="objectives" value={objectives} />
        <input type="hidden" name="supervisorId" value={selectedSupervisorId} />

        <CardContent className="pt-6 space-y-5">
          {state?.error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{state.error}</p>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Research Project Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Deep Learning Approaches for Distributed Denial of Service Detection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Summarize the motivation, problem statement, methodologies, and expected outcomes (approx. 200-300 words)..."
                  rows={5}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Objectives & Methodology (Optional)
                </label>
                <Textarea
                  placeholder="List specific milestones, dataset acquisition plans, or research questions..."
                  rows={3}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Supervisor selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>
                    Select Faculty Supervisor <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    {filteredFaculty.length} AIUB CS Faculty available
                  </span>
                </label>

                <div className="relative">
                  <Input
                    placeholder="Search supervisor by name, interest (e.g. #NLP, #DeepLearning)..."
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>

                <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  {filteredFaculty.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                      No faculty found matching &quot;{facultySearch}&quot;.
                    </div>
                  ) : (
                    filteredFaculty.map((faculty) => {
                      const isSelected = selectedSupervisorId === faculty.id;
                      return (
                        <div
                          key={faculty.id}
                          onClick={() => setSelectedSupervisorId(faculty.id)}
                          className={`p-3 cursor-pointer transition-colors flex items-start justify-between ${
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-950/60 border-l-4 border-blue-600 dark:border-blue-500"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {faculty.name}
                              </span>
                              {faculty.designation && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                  {faculty.designation}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {faculty.email} • {faculty.department}
                            </p>
                            {faculty.research_interests && faculty.research_interests.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {faculty.research_interests.slice(0, 4).map((ri, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                                  >
                                    #{ri}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {!selectedSupervisorId && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    * Please click to choose a supervisor from the list above.
                  </p>
                )}
              </div>

              {/* File Attachment */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Proposal Document Attachment (PDF / DOCX, max 25MB)
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <FileUp className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Drag and drop or browse file
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Accepts .pdf and .docx up to 25 MB
                  </p>
                  <input
                    type="file"
                    name="attachment"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="mt-3 text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-950/60 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60 cursor-pointer"
                  />
                  {fileName && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-900/60">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{fileName}</span>
                    </div>
                  )}
                  {fileError && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">{fileError}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
          {step === 1 ? (
            <div></div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!title.trim() || !abstract.trim()}
              className="gap-1 ml-auto"
            >
              Continue to Supervisor
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                name="isDraft"
                value="true"
                variant="outline"
                disabled={isPending || !selectedSupervisorId}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                name="isDraft"
                value="false"
                disabled={isPending || !selectedSupervisorId}
              >
                {isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
