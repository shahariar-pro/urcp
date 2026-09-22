"use client";

import { useState } from "react";
import { Profile, UserRole } from "@/types/database.types";
import {
  updateUserRoleAction,
  toggleUserStatusAction,
} from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  initialUsers: Profile[];
}

export function UsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.university_email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setFeedback(null);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const res = await updateUserRoleAction(userId, newRole);
    if (res.error) {
      setFeedback(`Error: ${res.error}`);
    } else {
      setFeedback(res.success || "Role updated and logged to audit trail.");
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setFeedback(null);
    const nextStatus = !currentStatus;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: nextStatus } : u))
    );

    const res = await toggleUserStatusAction(userId, nextStatus);
    if (res.error) {
      setFeedback(`Error: ${res.error}`);
    } else {
      setFeedback(res.success || "User status updated and logged.");
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3 text-xs rounded-lg border flex items-center gap-2 ${
            feedback.startsWith("Error")
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {feedback.startsWith("Error") ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {filteredUsers.length} Registered Accounts
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3">Registered</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">
                      {user.full_name}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {user.university_email}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {user.department}
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={user.is_active ? "success" : "destructive"}
                      className="text-[10px]"
                    >
                      {user.is_active ? "Active" : "Deactivated"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleStatusToggle(user.id, user.is_active)
                      }
                      className={`h-7 text-xs px-2.5 ${
                        user.is_active
                          ? "text-red-600 hover:bg-red-50 border-red-200"
                          : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      {user.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
