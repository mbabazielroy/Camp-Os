"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fail(mode: string, redirectTo: string, message: string): never {
  const params = new URLSearchParams({ mode, error: message });
  if (redirectTo) params.set("redirectTo", redirectTo);
  redirect(`/login?${params.toString()}`);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  if (!email || !password) {
    fail("signin", redirectTo, "Enter your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    fail("signin", redirectTo, error.message);
  }

  redirect(redirectTo || "/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const campName = String(formData.get("campName") ?? "").trim();

  if (!email || !password) {
    fail("signup", "", "Enter your email and password.");
  }
  if (password.length < 6) {
    fail("signup", "", "Password must be at least 6 characters.");
  }

  const supabase = await createClient();
  // camp_name is picked up by the handle_new_user trigger, which either
  // creates a camp with this name or joins a camp the email was invited to.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, camp_name: campName } },
  });

  if (error) {
    fail("signup", "", error.message);
  }

  if (!data.session) {
    // Email confirmation is required before a session exists.
    redirect(
      `/login?mode=signin&notice=${encodeURIComponent(
        "Account created. Check your email to confirm, then sign in."
      )}`
    );
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
