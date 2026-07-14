import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "@/app/components/SiteNav";
import { createClient } from "@/lib/supabase/server";
import type { Disposition } from "@/lib/types";

export default async function DetachmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: detachment },
    { data: dispositions },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from("detachments").select("*, factions(name)").eq("id", id).single(),
    supabase.from("dispositions").select("*").order("id"),
    supabase.auth.getUser(),
  ]);

  if (!detachment) notFound();

  const factionName = (detachment.factions as { name: string } | null)?.name ?? "Unknown faction";
  const dispositionNameById = new Map((dispositions ?? []).map((d: Disposition) => [d.id, d.name]));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav activePath="/detachments" />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/detachments" className="mb-6 inline-block text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to detachments
        </Link>

        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold">{detachment.name}</h1>
          <span className="shrink-0 text-sm text-gray-500">{detachment.dp_cost} DP</span>
        </div>
        <p className="mb-4 text-sm text-gray-400">{factionName}</p>

        <div className="mb-4 flex flex-wrap gap-1">
          {detachment.disposition_ids.map((dId: number, i: number) => (
            <span
              key={dId}
              className={`rounded-full px-2 py-0.5 text-xs ${
                i === 0 ? "bg-white text-gray-900" : "bg-gray-800 text-gray-300"
              }`}
            >
              {dispositionNameById.get(dId) ?? "?"}
              {i === 0 ? " (primary)" : ""}
            </span>
          ))}
        </div>

        {detachment.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {detachment.tags.map((tag: string) => (
              <span key={tag} className="rounded bg-gray-800/60 px-1.5 py-0.5 text-[11px] text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          {detachment.notes && <p className="mb-3 text-sm text-gray-400">{detachment.notes}</p>}

          {detachment.rule_text ? (
            <p className="whitespace-pre-wrap text-sm text-gray-300">{detachment.rule_text}</p>
          ) : (
            <p className="text-sm text-gray-600 italic">Rule text not added yet.</p>
          )}

          {detachment.source && <p className="mt-3 text-xs text-gray-500">Source: {detachment.source}</p>}
        </div>

        {user && (
          <Link
            href={`/admin/detachments/${detachment.id}/edit`}
            className="mt-4 inline-block text-sm text-gray-500 hover:text-white transition-colors"
          >
            Edit rule text
          </Link>
        )}
      </main>
    </div>
  );
}
