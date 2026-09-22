"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserRole, Profile } from "@/types/database.types";

export type AuthState = {
  error?: string | null;
  success?: string | null;
};

function isValidAiubEmail(email: string): boolean {
  const clean = email.trim().toLowerCase();
  return (
    clean.endsWith("@aiub.edu") ||
    clean.endsWith("@student.aiub.edu") ||
    clean.endsWith(".aiub.edu")
  );
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

export async function signUpAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = (formData.get("role") as UserRole) || "student";
  const department =
    (formData.get("department") as string) || "Department of Computer Science";

  if (!email || !password || !fullName) {
    return { error: "Please fill in all required fields." };
  }

  // Strict AIUB email enforcement (@student.aiub.edu or @aiub.edu)
  const cleanEmail = email.trim().toLowerCase();
  if (!isValidAiubEmail(cleanEmail)) {
    return {
      error:
        "Access restricted: Please enter an official AIUB email address (@student.aiub.edu or @aiub.edu).",
    };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        department: department,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Registration successful! Please check your AIUB university email to verify your account before logging in.",
  };
}

export async function signInAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Please enter your university email and password." };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!isValidAiubEmail(cleanEmail)) {
    return {
      error:
        "Only official AIUB university email accounts (@student.aiub.edu or @aiub.edu) are permitted.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your AIUB email address." };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!isValidAiubEmail(cleanEmail)) {
    return {
      error:
        "Only official AIUB university email accounts (@student.aiub.edu or @aiub.edu) are permitted.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=/profile`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Password reset link has been dispatched to your AIUB email. Please check your inbox.",
  };
}
