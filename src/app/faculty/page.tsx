import { getFacultyMembers } from "@/lib/faculty";
import { getCurrentProfile } from "@/app/actions/auth";
import { Navbar } from "@/components/navbar";
import { FacultyDirectoryClient } from "./faculty-client";

export default async function FacultyPage() {
  const profile = await getCurrentProfile();
  const facultyMembers = await getFacultyMembers();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AIUB Faculty Supervisor Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and connect with faculty members by research interests, department, and academic background
          </p>
        </div>

        <FacultyDirectoryClient initialFaculty={facultyMembers} />
      </main>
    </div>
  );
}
