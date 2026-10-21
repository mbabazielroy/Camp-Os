"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCamp } from "@/lib/auth";
import type { TaskPriority } from "@/lib/supabase/database.types";
import { field } from "@/lib/form";

function revalidateTaskViews() {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createTask(formData: FormData) {
  const { supabase, campId, userId } = await requireCamp();

  const title = field(formData, "title").trim();
  if (!title) return;

  const description = field(formData, "description").trim() || null;
  const dueDate = field(formData, "due_date").trim() || null;
  const priority = ((field(formData, "priority") || "medium") as TaskPriority) || "medium";

  await supabase.from("tasks").insert({
    camp_id: campId,
    created_by: userId,
    title,
    description,
    due_date: dueDate,
    priority,
  });

  revalidateTaskViews();
}

export async function updateTask(id: string, formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const title = field(formData, "title").trim();
  if (!title) return;
  const description = field(formData, "description").trim() || null;
  const dueDate = field(formData, "due_date").trim() || null;
  const priority = ((field(formData, "priority") || "medium") as TaskPriority) || "medium";

  await supabase
    .from("tasks")
    .update({ title, description, due_date: dueDate, priority })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidateTaskViews();
}

export async function toggleTaskStatus(id: string, nextStatus: "open" | "done") {
  const { supabase, campId } = await requireCamp();

  await supabase
    .from("tasks")
    .update({ status: nextStatus })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidateTaskViews();
}

export async function deleteTask(id: string) {
  const { supabase, campId } = await requireCamp();

  await supabase.from("tasks").delete().eq("id", id).eq("camp_id", campId);

  revalidateTaskViews();
  redirect("/tasks");
}
