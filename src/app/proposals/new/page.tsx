import { getFacultyMembers } from "@/lib/faculty";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { ProposalForm } from "./proposal-form";
import { Navbar } from "@/components/navbar";

export default async function NewProposalPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/proposals/new");
  }

  // Fetch faculty members from directory
  const facultyMembers = await getFacultyMembers();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-4xl px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Submit Undergraduate Research Proposal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Department of Computer Science • AIUB (CSC 3114)
          </p>
        </div>

        <ProposalForm facultyMembers={facultyMembers} />
      </main>
    </div>
  );
}
