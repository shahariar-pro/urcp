import Link from "next/link";
import { getCurrentProfile } from "@/app/actions/auth";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userProfile={profile} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-20 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            AIUB Department of Computer Science • Summer 2025-2026
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto leading-tight">
            Undergraduate Research Collaboration Platform
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The unified system of record for AIUB undergraduate thesis and capstone projects.
            Submit proposals, collaborate on literature reviews, manage versioned drafts, and coordinate supervisor feedback.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {profile ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 shadow-sm">
                  Go to Workspace Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="gap-2 shadow-sm">
                    Sign In with @aiub.edu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Register New Account
                  </Button>
                </Link>
              </>
            )}
            <Link href="/faculty">
              <Button size="lg" variant="ghost" className="gap-2 text-slate-700">
                <Search className="h-4 w-4" />
                Browse Supervisor Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars of URCP */}
      <section className="py-16 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Engineered Specifically for AIUB Computer Science
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Replaces fragmented emails, chat groups, and lost Google Drive links with four integrated modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                1. Proposal Workflow
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structured 2-step submissions with file uploads. Supervisors review with immutable, timestamped audit decisions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                2. Literature Hub
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized paper repository with automated fuzzy title duplicate detection to prevent redundant reading.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                3. Drafts & Versions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retains at least 10 historical versions per document with diff comparison and inline supervisor comments.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                4. Scoped Privacy & RBAC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict Row Level Security. Admins view department-level aggregates without accessing private chats or drafts.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team and Course Credits */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-slate-900">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <span>URCP • CSC 3114 Project</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supervised by <strong className="text-slate-700">Sourav Akib Sarkar</strong>, Department of Computer Science, AIUB
            </p>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Student Project Team:</p>
            <p>Dewan Shahariar Hossen (24-59069-3) • Md. Tajrian Islam Patwary (24-59093-3) • Md. Siam Tasbir (24-59099-3)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
