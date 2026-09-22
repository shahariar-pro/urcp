import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AdminNav } from "../admin-nav";
import { UsersClient } from "./users-client";
import { Profile } from "@/types/database.types";

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/admin/users");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Fetch all user profiles
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Roles & Access Control (RBAC)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student, faculty, and administrator privileges across the CS department. All modifications are logged.
          </p>
        </div>

        <AdminNav activeTab="users" />

        <UsersClient initialUsers={(users as Profile[]) || []} />
      </main>
    </div>
  );
}
