import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AdminNav } from "../admin-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, Lock, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminAuditPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/admin/audit");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Fetch immutable audit logs
  const { data: logs } = await supabase
    .from("audit_log")
    .select(`
      *,
      actor:actor_id(id, full_name, university_email, role)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-purple-600" />
            Security & System Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cryptographically timestamped and trigger-enforced immutable history of role adjustments, proposal approvals, and administrative actions
          </p>
        </div>

        <AdminNav activeTab="audit" />

        {/* Immutability Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs shadow-xs">
          <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Database-Level Immutability:</strong> The <code className="text-emerald-300">prevent_audit_update()</code> PostgreSQL trigger strictly forbids UPDATE and DELETE operations on this table to guarantee audit integrity.
          </span>
        </div>

        {/* Audit Log Table */}
        <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Target Entity</th>
                  <th className="px-5 py-3">Metadata / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!logs || logs.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400 italic">
                      No security audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {log.actor?.full_name || "System"}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {log.actor?.university_email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {log.target_table} • #{log.target_id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
