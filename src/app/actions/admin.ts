"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/types/database.types";

export type AdminActionState = {
  error?: string | null;
  success?: string | null;
};

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Check if current user is admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  // Update role
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  // Mandatory audit log record per spec §4.4 & §6 Scope 3
  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "role_change",
    target_table: "profiles",
    target_id: userId,
    metadata: { new_role: newRole },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/analytics");
  return { success: `User role successfully updated to ${newRole}.` };
}

export async function toggleUserStatusAction(
  userId: string,
  newStatus: boolean
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: newStatus })
    .eq("id", userId);

  if (error) return { error: error.message };

  // Write to immutable audit_log
  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: newStatus ? "user_activated" : "user_deactivated",
    target_table: "profiles",
    target_id: userId,
    metadata: { is_active: newStatus },
  });

  revalidatePath("/admin/users");
  return { success: `User status updated.` };
}
