"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DecisionType } from "@/types/database.types";

export type ProposalActionState = {
  error?: string | null;
  success?: string | null;
};

export async function submitProposalAction(
  prevState: ProposalActionState,
  formData: FormData
): Promise<ProposalActionState> {
  const title = (formData.get("title") as string)?.trim();
  const abstract = (formData.get("abstract") as string)?.trim();
  const objectives = (formData.get("objectives") as string)?.trim();
  const supervisorId = formData.get("supervisorId") as string;
  const isDraft = formData.get("isDraft") === "true";
  const file = formData.get("attachment") as File | null;

  if (!title || !abstract || !supervisorId) {
    return { error: "Title, abstract, and supervisor selection are required." };
  }

  // File validation per spec §7.2: PDF/DOCX only, 25MB max
  if (file && file.size > 0) {
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSizeBytes) {
      return { error: "Attachment file exceeds maximum limit of 25MB." };
    }

    const allowedExtensions = [".pdf", ".docx", ".doc"];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!isAllowed) {
      return {
        error: "Invalid file format. Only PDF and DOCX documents are accepted.",
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a research proposal." };
  }

  // Insert proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .insert({
      submitted_by: user.id,
      supervisor_id: supervisorId,
      title,
      abstract,
      objectives,
      status: isDraft ? "draft" : "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (proposalError) {
    return { error: proposalError.message };
  }

  // Handle file upload if present
  if (file && file.size > 0 && proposal) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${proposal.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("proposals")
      .upload(filePath, file);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("proposals").getPublicUrl(filePath);

      await supabase.from("proposal_attachments").insert({
        proposal_id: proposal.id,
        file_url: publicUrl || filePath,
        file_name: file.name,
        file_size: file.size,
      });
    }
  }

  revalidatePath("/proposals");
  revalidatePath("/dashboard");
  redirect(`/proposals`);
}

export async function decideProposalAction(
  prevState: ProposalActionState,
  formData: FormData
): Promise<ProposalActionState> {
  const proposalId = formData.get("proposalId") as string;
  const decision = formData.get("decision") as DecisionType;
  const feedback = (formData.get("feedback") as string)?.trim();

  if (!proposalId || !decision) {
    return { error: "Missing proposal ID or decision." };
  }

  // SRS Requirement: Feedback is mandatory for changes_requested and rejected
  if (decision !== "approved" && (!feedback || feedback.length < 5)) {
    return {
      error:
        "Detailed feedback is mandatory when requesting changes or rejecting a proposal.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to review proposals." };
  }

  // Insert immutable proposal decision
  const { error: decisionError } = await supabase
    .from("proposal_decisions")
    .insert({
      proposal_id: proposalId,
      decided_by: user.id,
      decision: decision,
      feedback: feedback || "Proposal approved.",
      decided_at: new Date().toISOString(),
    });

  if (decisionError) {
    return { error: decisionError.message };
  }

  // Fallback programmatic check in case trigger is deferred:
  // Update proposal status
  await supabase
    .from("proposals")
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
    })
    .eq("id", proposalId);

  revalidatePath(`/proposals/${proposalId}/review`);
  revalidatePath("/proposals");
  revalidatePath("/dashboard");

  return { success: `Proposal successfully marked as ${decision.replace("_", " ")}.` };
}
