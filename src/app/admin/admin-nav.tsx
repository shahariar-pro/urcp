import Link from "next/link";
import { BarChart3, Users, ShieldAlert } from "lucide-react";

interface Props {
  activeTab: "analytics" | "users" | "audit";
}

export function AdminNav({ activeTab }: Props) {
  const tabs = [
    {
      id: "analytics",
      label: "Department Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      id: "users",
      label: "Roles & Access Control",
      href: "/admin/users",
      icon: Users,
    },
    {
      id: "audit",
      label: "Security Audit Logs",
      href: "/admin/audit",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur px-4 py-2 scrollbar-none -mx-4 sm:mx-0 sm:rounded-lg sm:border sm:p-1.5 sm:mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-all shrink-0 select-none ${
              isActive
                ? "bg-purple-600 text-white font-semibold shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
