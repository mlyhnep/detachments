"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EditState = { error?: string } | null;

export async function updateDetachmentRuleText(
  _prevState: EditState,
  formData: FormData
): Promise<EditState> {
  const id = Number(formData.get("id"));
  const ruleText = (formData.get("rule_text") as string) ?? "";
  const source = (formData.get("source") as string) ?? "";

  const supabase = await createClient();
  const { error } = await supabase
    .from("detachments")
    .update({
      rule_text: ruleText.trim() ? ruleText : null,
      source: source.trim() ? source : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/detachments");
  revalidatePath("/scout");
  redirect("/detachments");
}
