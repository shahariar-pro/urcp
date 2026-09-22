import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AnalyticsClient } from "./analytics-client";
import { AdminNav } from "../admin-nav";

export default async function AdminAnalyticsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/admin/analytics");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // 1. Fetch total counts
  const { count: totalProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: activeProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  const { count: totalFaculty } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "faculty");

  // 2. Fetch projects for status breakdown
  const { data: projects } = await supabase
    .from("projects")
    .select("status, supervisor_id, supervisor:supervisor_id(full_name)");

  // Aggregate project status breakdown
  const statusCounts: Record<string, number> = {
    active: 0,
    completed: 0,
    needs_attention: 0,
    archived: 0,
  };

  const supervisorWorkload: Record<string, { name: string; count: number }> = {};

  (projects || []).forEach((p: any) => {
    if (statusCounts[p.status] !== undefined) {
      statusCounts[p.status]++;
    } else {
      statusCounts[p.status] = 1;
    }

    const supName = p.supervisor?.full_name || "Unassigned";
    if (!supervisorWorkload[supName]) {
      supervisorWorkload[supName] = { name: supName, count: 0 };
    }
    supervisorWorkload[supName].count++;
  });

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace("_", " ").toUpperCase(),
    value: count,
  }));

  const workloadChartData = Object.values(supervisorWorkload).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Department Research Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            High-level oversight of research projects, supervisory workload, and department throughput
          </p>
        </div>

        <AdminNav activeTab="analytics" />

        <AnalyticsClient
          totalProjects={totalProjects || 0}
          activeProjects={activeProjects || 0}
          totalStudents={totalStudents || 0}
          totalFaculty={totalFaculty || 0}
          statusChartData={statusChartData}
          workloadData={workloadChartData}
        />
      </main>
    </div>
  );
}
