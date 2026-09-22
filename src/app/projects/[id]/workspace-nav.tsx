"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  CheckSquare,
  FileEdit,
  MessageSquare,
  Calendar,
} from "lucide-react";

interface Props {
  projectId: string;
}

export function WorkspaceNav({ projectId }: Props) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: `/projects/${projectId}`,
      icon: LayoutGrid,
      exact: true,
    },
    {
      name: "Literature",
      href: `/projects/${projectId}/literature`,
      icon: BookOpen,
      exact: false,
    },
    {
      name: "Tasks & Milestones",
      href: `/projects/${projectId}/tasks`,
      icon: CheckSquare,
      exact: false,
    },
    {
      name: "Drafts & Docs",
      href: `/projects/${projectId}/documents`,
      icon: FileEdit,
      exact: false,
    },
    {
      name: "Chat",
      href: `/projects/${projectId}/chat`,
      icon: MessageSquare,
      exact: false,
    },
    {
      name: "Calendar",
      href: `/projects/${projectId}/calendar`,
      icon: Calendar,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur px-4 py-2 scrollbar-none -mx-4 sm:mx-0 sm:rounded-lg sm:border sm:p-1.5 sm:mb-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-all shrink-0 select-none ${
              isActive
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
