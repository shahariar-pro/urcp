import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle2,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Check,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { markNotificationReadAction } from "@/app/actions/communication";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/notifications");
  }

  const supabase = await createClient();

  // Fetch user notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "proposal_decision":
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "meeting_update":
        return <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "new_comment":
        return <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Notifications & Alerts
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Proposal evaluations, supervisor meeting updates, and workspace activity
            </p>
          </div>
        </div>

        {(!notifications || notifications.length === 0) ? (
          <Card className="border-dashed bg-white dark:bg-slate-900/40">
            <CardContent className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notifications</p>
              <p className="text-xs text-slate-400">
                You will receive alerts here when your supervisor evaluates proposals or schedules meetings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isRead = !!n.read_at;
              const payload = n.payload || {};

              return (
                <Card
                  key={n.id}
                  className={`border transition-all shadow-2xs ${
                    isRead
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      : "bg-blue-50/40 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/80 dark:border-slate-700 shrink-0">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {payload.title || payload.message || n.type.replace("_", " ").toUpperCase()}
                          </span>
                          {!isRead && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-blue-600">
                              New
                            </Badge>
                          )}
                        </div>
                        {payload.decision && (
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                            Decision: {payload.decision.replace("_", " ")}
                          </p>
                        )}
                        {payload.feedback && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-2 rounded border border-slate-200 dark:border-slate-700">
                            {payload.feedback}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {formatDateTime(n.created_at)}
                        </p>
                      </div>
                    </div>

                    {!isRead && (
                      <form
                        action={async () => {
                          "use server";
                          await markNotificationReadAction(n.id);
                        }}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
