import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditForm from "./EditForm";

export default async function EditDetachmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: detachment } = await supabase
    .from("detachments")
    .select("*, factions(name)")
    .eq("id", id)
    .single();

  if (!detachment) notFound();

  const factionName = (detachment.factions as { name: string } | null)?.name ?? "Unknown faction";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-bold">{detachment.name}</h1>
        <p className="mb-6 text-sm text-gray-400">{factionName}</p>
        <EditForm
          id={detachment.id}
          ruleText={detachment.rule_text}
          source={detachment.source}
          notes={detachment.notes}
        />
      </div>
    </main>
  );
}
