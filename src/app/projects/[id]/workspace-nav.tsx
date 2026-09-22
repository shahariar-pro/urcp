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
      name: "Literature Repository",
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
      name: "Drafts & Documents",
      href: `/projects/${projectId}/documents`,
      icon: FileEdit,
      exact: false,
    },
    {
      name: "Project Chat",
      href: `/projects/${projectId}/chat`,
      icon: MessageSquare,
      exact: false,
    },
    {
      name: "Meetings / Calendar",
      href: `/projects/${projectId}/calendar`,
      icon: Calendar,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
