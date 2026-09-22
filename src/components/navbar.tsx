"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Profile } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/actions/auth";
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Search,
  User,
  LogOut,
  ShieldAlert,
  Bell,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  userProfile?: Profile | null;
}

export function Navbar({ userProfile }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile drawer on route navigation
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/proposals", label: "Proposals", icon: FileText },
    { href: "/faculty", label: "Find Supervisor", icon: Search },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-xs transition-colors">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white tracking-tight"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight">URCP</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-normal">
                AIUB Dept. of CS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {userProfile && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              {userProfile.role === "admin" && (
                <Link
                  href="/admin/analytics"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold"
                      : "text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right side controls (Desktop & Mobile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Mode Toggle */}
          <ThemeToggle />

          {userProfile ? (
            <>
              {/* Desktop User Info & Quick Actions */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">
                  {userProfile.full_name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                className="hidden sm:inline-flex capitalize text-[11px]"
              >
                {userProfile.role}
              </Badge>

              <Link href="/notifications" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" title="Notifications" aria-label="Notifications">
                  <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </Button>
              </Link>
              <Link href="/profile" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" title="View Profile" aria-label="Profile">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </Button>
              </Link>
              <form action={signOutAction} className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" type="submit" title="Sign Out" aria-label="Sign Out">
                  <LogOut className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </Button>
              </form>

              {/* Mobile Hamburger Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                )}
              </Button>
            </>
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

      {/* Mobile Drawer / Slide-down Menu */}
      {userProfile && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* User Profile Summary */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {userProfile.full_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userProfile.university_email}
              </p>
            </div>
            <Badge
              variant={
                userProfile.role === "admin"
                  ? "destructive"
                  : userProfile.role === "faculty"
                  ? "default"
                  : "secondary"
              }
              className="capitalize text-xs"
            >
              {userProfile.role}
            </Badge>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {userProfile.role === "admin" && (
              <Link
                href="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold"
                    : "text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                Admin Console
              </Link>
            )}

            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-1">
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <form action={signOutAction} className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
