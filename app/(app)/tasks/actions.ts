"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/lib/supabase/database.types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

function revalidateTaskViews() {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createTask(formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const description = String(formData.get("description") ?? "").trim() || null;
  const dueDate = String(formData.get("due_date") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "medium") as TaskPriority) || "medium";

  await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description,
    due_date: dueDate,
    priority,
  });

  revalidateTaskViews();
}

export async function updateTask(id: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  const dueDate = String(formData.get("due_date") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "medium") as TaskPriority) || "medium";

  await supabase
    .from("tasks")
    .update({ title, description, due_date: dueDate, priority })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidateTaskViews();
}

export async function toggleTaskStatus(id: string, nextStatus: "open" | "done") {
  const { supabase, user } = await requireUser();

  await supabase
    .from("tasks")
    .update({ status: nextStatus })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidateTaskViews();
}

export async function deleteTask(id: string) {
  const { supabase, user } = await requireUser();

  await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);

  revalidateTaskViews();
  redirect("/tasks");
}
