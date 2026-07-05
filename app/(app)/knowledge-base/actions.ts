"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCamp } from "@/lib/auth";
import { KB_STARTERS } from "@/lib/kb-starters";
import type { KnowledgeCategory } from "@/lib/supabase/database.types";

export async function createKnowledgeEntry(formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return;

  const category = (String(formData.get("category") ?? "other") as KnowledgeCategory) || "other";

  await supabase.from("knowledge_base").insert({
    camp_id: campId,
    title,
    content,
    category,
  });

  revalidatePath("/knowledge-base");
}

export async function updateKnowledgeEntry(id: string, formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return;
  const category = (String(formData.get("category") ?? "other") as KnowledgeCategory) || "other";

  await supabase
    .from("knowledge_base")
    .update({ title, content, category })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidatePath("/knowledge-base");
  redirect("/knowledge-base");
}

export async function deleteKnowledgeEntry(id: string) {
  const { supabase, campId } = await requireCamp();

  await supabase.from("knowledge_base").delete().eq("id", id).eq("camp_id", campId);

  revalidatePath("/knowledge-base");
  redirect("/knowledge-base");
}

// Adds the starter pack of common camp policies for the director to edit.
// Skips any starter whose title already exists so it can't create duplicates.
export async function addStarterPack() {
  const { supabase, campId } = await requireCamp();

  const { data: existing } = await supabase
    .from("knowledge_base")
    .select("title")
    .eq("camp_id", campId);

  const existingTitles = new Set((existing ?? []).map((e) => e.title.toLowerCase()));

  const rows = KB_STARTERS.filter(
    (starter) => !existingTitles.has(starter.title.toLowerCase())
  ).map((starter) => ({
    camp_id: campId,
    title: starter.title,
    content: starter.content,
    category: starter.category,
  }));

  if (rows.length > 0) {
    await supabase.from("knowledge_base").insert(rows);
  }

  revalidatePath("/knowledge-base");
  revalidatePath("/dashboard");
}
