import { getCurrentProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building, Tag, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?redirectTo=/profile");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Navbar userProfile={profile} />

      <main className="container mx-auto max-w-4xl px-4 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Academic credentials and platform role
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-lg">
                  {profile.full_name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900 dark:text-white">{profile.full_name}</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.university_email}</p>
                </div>
              </div>
              <Badge
                variant={
                  profile.role === "admin"
                    ? "destructive"
                    : profile.role === "faculty"
                    ? "default"
                    : "secondary"
                }
                className="capitalize"
              >
                {profile.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> University Email
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {profile.university_email}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> Department
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {profile.department}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Account Status
                </span>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {profile.is_active ? "Active & Verified" : "Pending Verification"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Member Since
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            {profile.short_bio && (
              <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Short Biography
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {profile.short_bio}
                </p>
              </div>
            )}

            {profile.research_interests && profile.research_interests.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Research Interests
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.research_interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      #{interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
