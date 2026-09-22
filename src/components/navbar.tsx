"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Profile } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/app/actions/auth";
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Search,
  User,
  LogOut,
  ShieldAlert,
} from "lucide-react";

interface NavbarProps {
  userProfile?: Profile | null;
}

export function Navbar({ userProfile }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-xs">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight">URCP</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-normal">AIUB Dept. of CS</span>
            </div>
          </Link>

          {userProfile && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/proposals"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive("/proposals")
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-4 w-4" />
                Proposals
              </Link>
              <Link
                href="/faculty"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive("/faculty")
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Search className="h-4 w-4" />
                Find Supervisor
              </Link>
              {userProfile.role === "admin" && (
                <Link
                  href="/admin/analytics"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-purple-50 text-purple-700 font-semibold"
                      : "text-purple-600 hover:text-purple-900 hover:bg-purple-50/50"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-800 leading-none">
                  {userProfile.full_name}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {userProfile.university_email}
                </span>
              </div>
              <Badge
                variant={
                  userProfile.role === "admin"
                    ? "destructive"
                    : userProfile.role === "faculty"
                    ? "default"
                    : "secondary"
                }
                className="capitalize text-[11px]"
              >
                {userProfile.role}
              </Badge>
              <Link href="/profile">
                <Button variant="ghost" size="icon" title="View Profile">
                  <User className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
              <form action={signOutAction}>
                <Button variant="ghost" size="icon" type="submit" title="Sign Out">
                  <LogOut className="h-4 w-4 text-slate-600" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
