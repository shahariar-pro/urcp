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
    <div className="flex items-center gap-2 border-b border-slate-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              isActive
                ? "border-purple-600 text-purple-700 bg-purple-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
