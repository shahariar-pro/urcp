"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Building,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    error: null,
    success: null,
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create AIUB URCP Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join the Computer Science Research Collaboration Platform
          </p>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-slate-900 dark:text-white">Registration</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Requires an official @aiub.edu email address
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              {state?.error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{state.error}</p>
                </div>
              )}

              {state?.success && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">Verification Sent</p>
                    <p className="mt-1">{state.success}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    name="fullName"
                    placeholder="e.g. Dewan Shahariar Hossen"
                    required
                    className="pl-9"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  University Email (@student.aiub.edu or @aiub.edu)
                </label>
                <div className="relative">
                  <Input
                    name="email"
                    type="email"
                    placeholder="xx-xxxxx-x@student.aiub.edu or teacher@aiub.edu"
                    required
                    className="pl-9"
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enforced: Students use @student.aiub.edu, faculty & staff use @aiub.edu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Primary Role
                  </label>
                  <select
                    name="role"
                    className="flex h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    defaultValue="student"
                  >
                    <option value="student">Student Researcher</option>
                    <option value="faculty">Faculty Supervisor</option>
                    <option value="admin">Department Administrator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <div className="relative">
                    <Input
                      name="department"
                      defaultValue="Department of Computer Science"
                      required
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-9"
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !!state?.success}
              >
                {isPending ? "Creating account..." : "Register"}
              </Button>
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
