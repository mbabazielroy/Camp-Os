"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { DEMO_COOKIE } from "@/lib/demo/client";
import { field } from "@/lib/form";

// Without a database the app runs on sample data; this cookie stands in for
// a session so the login screen is still part of the walkthrough.
async function startDemoSession() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

function fail(mode: string, redirectTo: string, message: string): never {
  const params = new URLSearchParams({ mode, error: message });
  if (redirectTo) params.set("redirectTo", redirectTo);
  redirect(`/login?${params.toString()}`);
}

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) {
    await startDemoSession();
    redirect("/dashboard");
  }

  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  const redirectTo = (field(formData, "redirectTo") || "/dashboard");

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
  if (!isSupabaseConfigured()) {
    await startDemoSession();
    redirect("/dashboard");
  }

  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  const fullName = field(formData, "fullName").trim();
  const campName = field(formData, "campName").trim();

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
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
