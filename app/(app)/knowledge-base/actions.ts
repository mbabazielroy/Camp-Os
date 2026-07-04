"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { KnowledgeCategory } from "@/lib/supabase/database.types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function createKnowledgeEntry(formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return;

  const category = (String(formData.get("category") ?? "other") as KnowledgeCategory) || "other";

  await supabase.from("knowledge_base").insert({
    user_id: user.id,
    title,
    content,
    category,
  });

  revalidatePath("/knowledge-base");
}

export async function updateKnowledgeEntry(id: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return;
  const category = (String(formData.get("category") ?? "other") as KnowledgeCategory) || "other";

  await supabase
    .from("knowledge_base")
    .update({ title, content, category })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/knowledge-base");
  redirect("/knowledge-base");
}

export async function deleteKnowledgeEntry(id: string) {
  const { supabase, user } = await requireUser();

  await supabase.from("knowledge_base").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/knowledge-base");
  redirect("/knowledge-base");
}
